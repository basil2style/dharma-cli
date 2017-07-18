import Investment from './Investment';
import os from 'os';
import fs from 'fs-extra';
import BigNumber from 'bignumber.js';
import Util from '../Util';
import _ from 'lodash';
import Constants from '../Constants';

const PORTFOLIO_STORE_FILE = os.homedir() + '/.dharma/portfolio.json';

class Portfolio {
  constructor(web3, investments = {}) {
    this.web3 = web3;
    this.investments = investments;
    this.portfolioUpdateCallback = null;
  }

  addInvestment(investment) {
    const uuid = investment.loan.uuid;
    this.investments[uuid] = investment;
  }

  async getSummary() {
    const principalOutstanding = await this.getTotalOutstandingPrincipal();
    const interestEarned = await this.getTotalInterestEarned();
    const cash = await this.getTotalCash();
    const defaulted = await this.getTotalDefaultedValue();

    const summary =  {
      principalOutstanding: principalOutstanding,
      interestEarned: interestEarned,
      totalCash: cash,
      defaultedValue: defaulted,
    }
    return summary;
  }

  async getTotalCash() {
    let investors = {};
    let totalCash = new BigNumber(0);

    Object.keys(this.investments).forEach((uuid) => {
      const investor = this.investments[uuid].investor;
      if (!(investor in investors)) {
        investors[investor] = true;
      }
    });

    const investorList = Object.keys(investors);
    for (let i = 0; i < investorList.length; i++) {
      const cash = await Util.getBalance(this.web3, investorList[i]);
      totalCash = totalCash.plus(cash);
    }

    return totalCash;
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
    const currentInvestments = _.filter(Object.keys(this.investments), (uuid) => {
      const investment = this.investments[uuid];
      const balance = new BigNumber(investment.balance);
      if (balance.gt(0)) {
        return true;
      }
    });

    return _.map(currentInvestments, (uuid) => { return this.investments[uuid] });
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

  async getTotalOutstandingPrincipal() {
    const investmentsOutstanding = await this.getInvestmentsOutstanding();
    let totalPrincipal = new BigNumber(0);
    investmentsOutstanding.forEach((investment) => {
      totalPrincipal = totalPrincipal.plus(investment.balance);
    })
    return totalPrincipal;
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
    defaultedInvestments.forEach((investment) => {
      totalValue = totalValue.plus(investment.balance)
    })
    return totalValue;
  }

  async getTotalInterestEarned() {
    const investments = this.getInvestments();
    let totalInterest = new BigNumber(0);
    for (let i = 0; i < investments.length; i++) {
      const investment = investments[i];
      const interest = await investment.loan.servicing.getInterestEarnedToDate(new Date());

      totalInterest = totalInterest.add(interest);
    }
    return totalInterest;
  }

  forEachInvestment(callback) {
    for (let uuid in this.investments) {
      callback(this.getInvestment(uuid))
    }
  }

  static async load(dharma) {
    let raw;
    try {
      raw = await fs.readJson(PORTFOLIO_STORE_FILE);
    } catch (err) {
      console.log(err)
      throw new Error('Portfolio store file does not exist.');
    }

    let investments = {};

    const promises = Object.keys(raw).map(async function (uuid) {
      investments[uuid] = await Investment.fromJson(raw[uuid], dharma);
    }.bind(this))

    await Promise.all(promises);
    return new Portfolio(dharma.web3, investments);
  }

  toJson() {
    let raw = {};

    Object.keys(this.investments).forEach(function (uuid) {
      raw[uuid] = this.investments[uuid].toJson();
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
      const investment = this.getInvestment(uuid);
      // await investment.stopWatchingEvents();
    }
  }
}

module.exports = Portfolio;
