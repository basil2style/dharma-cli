import Investment from './Investment';
import os from 'os';
import fs from 'fs-extra';
import BigNumber from 'bignumber.js';
import Util from '../Util';
import _ from 'lodash';
import Constants from '../Constants';

const PORTFOLIO_STORE_FILE = os.homedir() + '/.dharma/portfolio.json';

class Portfolio {
  constructor(web3, wallet, investments = {}, bids = {}) {
    this.web3 = web3;
    this.wallet = wallet;
    this.investments = investments;
    this.bids = bids;
  }

  addBid(bid) {
    const uuid = bid.loan.uuid;
    this.bids[uuid] = bid;
  }

  removeBid(bid) {
    const uuid = bid.loan.uuid;
    delete this.bids[uuid];
  }

  addInvestment(investment) {
    const uuid = investment.loan.uuid;
    this.investments[uuid] = investment;
  }

  async getSummary() {
    const principalOutstanding = await this.getTotalOutstandingPrincipal();
    const principalCollected = await this.getTotalCollectedPrincipal();
    const interestCollected = await this.getTotalCollectedInterest();
    const cash = await this.getTotalCash();
    const defaulted = await this.getTotalDefaultedValue();

    const summary =  {
      principalOutstanding: principalOutstanding,
      principalCollected: principalCollected,
      interestCollected: interestCollected,
      totalCash: cash,
      defaultedValue: defaulted,
    }

    return summary;
  }

  async getTotalCash() {
    return await Util.getBalance(this.web3, this.wallet.getAddress());
  }

  async getTotalValue() {
    const loans = this.getLoans();
    const promises = loans.map((loan) => {
      return new Promise(async function(resolve, reject) {
        const balanceRepaid = await loan.amountRepaid();
        resolve(balanceRepaid);
      });
    })

    const amountsRepaid = await Promise.all(promises);
    let totalValue = await this.getTotalCash();
    amountsRepaid.forEach((amount) => {
      totalValue = totalValue.plus(amount);
    })

    return totalValue;
  }

  getInvestments() {
    const _this = this;

    const currentInvestments = _.filter(Object.keys(this.investments), (uuid) => {
      const investment = _this.investments[uuid];
      const balance = new BigNumber(investment.balance);
      if (balance.gt(0)) {
        return true;
      }
    });

    return _.map(currentInvestments, (uuid) => { return _this.investments[uuid] });
  }

  async getInvestmentsOutstanding() {
    const investments = this.getInvestments();
    let outstandingInvestments = [];
    for (let i = 0; i < investments.length; i++) {
      const investment = investments[i];
      const status = await investment.loan.servicing.getRepaymentStatus();
      if (status !== 'REPAID') {
        outstandingInvestments.push(investment);
      }
    }
    return outstandingInvestments;
  }

  async getTotalPrincipal() {
    const investmentsOutstanding = await this.getInvestmentsOutstanding();

    let totalPrincipal = new BigNumber(0);
    for (let i = 0; i < investmentsOutstanding.length; i++) {
      const investment = investmentsOutstanding[i];
      totalPrincipal = totalPrincipal.plus(investment.balance);
    }

    return totalPrincipal;
  }

  async getTotalCollectedPrincipal() {
    const investmentsOutstanding = await this.getInvestmentsOutstanding();

    let totalCollectedPrincipal = new BigNumber(0);
    for (let i = 0; i < investmentsOutstanding.length; i++) {
      const investment = investmentsOutstanding[i];
      const loan = investment.loan;
      const totalPrincipalRepaid = await loan.servicing.getPrincipalRepaidToDate();
      const investorsPrincipalRepaid =
        totalPrincipalRepaid.div(loan.principal).times(investment.balance)
      totalCollectedPrincipal =
        totalCollectedPrincipal.plus(investorsPrincipalRepaid);
    }

    return totalCollectedPrincipal;
  }

  async getTotalCollectedInterest() {
    const investmentsOutstanding = await this.getInvestmentsOutstanding();

    let totalCollectedInterest = new BigNumber(0);
    for (let i = 0; i < investmentsOutstanding.length; i++) {
      const investment = investmentsOutstanding[i];
      const loan = investment.loan;
      const interestEarned = await loan.servicing.getInterestRepaidToDate();
      const investorsInterestCollected =
        interestEarned.div(loan.principal).times(investment.balance)
      totalCollectedInterest =
        totalCollectedInterest.plus(investorsInterestCollected);
    }

    return totalCollectedInterest;
  }

  async getTotalOutstandingPrincipal() {
    const totalPrincipal = await this.getTotalPrincipal();
    const totalCollectedPrincipal = await this.getTotalCollectedPrincipal();

    return totalPrincipal.minus(totalCollectedPrincipal);
  }

  async getDelinquentInvestments() {
    const investments = this.getInvestments();
    let delinquentInvestments = [];
    for (let i = 0; i < investments.length; i++) {
      const investment = investments[i];
      const status = await investment.loan.servicing.getRepaymentStatus();
      if (status === 'DELINQUENT') {
        delinquentInvestments.push(loan);
      }
    }
    return delinquentInvestments;
  }

  async getDefaultedInvestments() {
    const investments = this.getInvestments();
    let defaultedInvestments = [];
    for (let i = 0; i < investments.length; i++) {
      const investment = investments[i];
      const status = await investment.loan.servicing.getRepaymentStatus();
      if (status === 'DEFAULT') {
        defaultedInvestments.push(loan);
      }
    }
    return defaultedInvestments;
  }

  async getTotalDefaultedValue() {
    const defaultedInvestments = await this.getDefaultedInvestments();
    let totalValue = new BigNumber(0);
    for (let i = 0; i < defaultedInvestments.length; i++) {
      const investment = defaultedInvestments[i];
      const loan = investment.loan;
      const totalRepaid = await loan.amountRepaid();
      const totalDefaulted = loan.principal.minus(totalRepaid);
      const totalDefaultedFromInvestor =
        totalDefaulted.times(investment.balance).div(loan.principal);
      totalValue = totalValue.plus(totalDefaultedFromInvestor)
    }
    return totalValue;
  }

  async getTotalInterestCollected() {
    const investments = this.getInvestments();
    let totalInterest = new BigNumber(0);
    for (let i = 0; i < investments.length; i++) {
      const investment = investments[i];
      const loan = investment.loan;
      const interest =
        await loan.servicing.getInterestRepaidToDate(new Date());
      const interestToInvestor =
        interest.times(investment.balance).div(loan.principal);
      totalInterest = totalInterest.add(interestToInvestor);
    }
    return totalInterest;
  }

  static async load(dharma, wallet) {
    let raw;
    try {
      raw = await fs.readJson(PORTFOLIO_STORE_FILE);
    } catch (err) {
      throw new Error('Portfolio store file does not exist.');
    }

    let investments = {};
    let bids = {};

    const loadInvestmentPromises = Object.keys(raw.investments).map(async function (uuid) {
      investments[uuid] = await Investment.fromJson(raw.investments[uuid], dharma);
    }.bind(this))
    const loadBidPromises = Object.keys(raw.bids).map(async function (uuid) {
      bids[uuid] = await Bid.fromJson(raw.bids[uuid], dharma);
    }.bind(this))

    const promises = [ ...loadInvestmentPromises, ...loadBidPromises ];

    await Promise.all(promises);

    return new Portfolio(dharma.web3, wallet, investments, bids);
  }

  toJson() {
    let raw = {
      investments: {},
      bids: {}
    }

    Object.keys(this.investments).forEach(function (uuid) {
      raw.investments[uuid] = this.investments[uuid].toJson();
    }.bind(this))

    Object.keys(this.bids).forEach(function (uuid) {
      raw.bids[uuid] = this.bids[uuid].toJson();
    }.bind(this))

    return raw;
  }

  async save() {
    let raw = this.toJson();
    await fs.outputJson(PORTFOLIO_STORE_FILE, raw);
  }

  getInvestment(uuid) {
    return this.investments[uuid];
  }

  async stopWatchingEvents() {
    for (let uuid in this.investments) {
      const investment = this.investments[uuid];
      await investment.stopWatchingEvents();
    }

    for (let uuid in this.bids) {
      const bid = this.bids[uuid]
      await bid.stopWatchingEvents();
    }
  }
}

module.exports = Portfolio;
