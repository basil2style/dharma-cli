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

  getRiskProfile() {
    const riskTranches = ['0-20', '21-40', '41-60', '61-80', '81-100'];
    let riskProfile = {}

    for (let i = 0; i < 5; i++) {
      let valueInvested = new BigNumber(0);
      const decimals = new BigNumber(10**18);
      const trancheWidth = new BigNumber(0.2);
      const defaultRiskMin = trancheWidth
                                .times(i)
                                .plus(0.01)
                                .times(decimals)
      const defaultRiskMax = trancheWidth
                                .times(i + 1)
                                .times(decimals)

      Object.keys(this.investments).forEach((uuid) => {
        const investment = this.investments[uuid];
        if (investment.loan.defaultRisk.gte(defaultRiskMin) &&
          investment.loan.defaultRisk.lte(defaultRiskMax)) {
          valueInvested = valueInvested.plus(investment.balance)
        }
      })

      riskProfile[riskTranches[i]] = valueInvested;
    }

    return riskProfile;
  }

  setPortfolioUpdateCallback(callback) {
    this.portfolioUpdateCallback = callback;
  }

  onPortfolioUpdate() {
    if (this.portfolioUpdateCallback) {
      this.portfolioUpdateCallback();
    }
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

  getLoans() {
    const currentInvestments = _.filter(Object.keys(this.investments), (uuid) => {
      const investment = this.investments[uuid];
      if (investment.balance.gt(0)) {
        return true;
      }
    });

    return _.map(currentInvestments, (uuid) => { return this.investments[uuid].loan });
  }

  async getLoansOutstanding() {
    const loans = this.getLoans();
    let outstandingLoans = [];
    for (let i = 0; i < loans.length; i++) {
      const loan = loans[i];
      const status = await loan.servicing.getRepaymentStatus();
      if (status !== 'REPAID') {
        outstandingLoans.push(loan);
      }
    }
    return outstandingLoans;
  }

  async getDelinquentLoans() {
    const loans = this.getLoans();
    let delinquentLoans = [];
    for (let i = 0; i < loans.length; i++) {
      const loan = loans[i];
      const status = await loan.servicing.getRepaymentStatus();
      if (status === 'DELINQUENT') {
        delinquentLoans.push(loan);
      }
    }
    return delinquentLoans;
  }

  async getDefaultedLoans() {
    const loans = this.getLoans();
    let defaultedLoans = [];
    for (let i = 0; i < loans.length; i++) {
      const loan = loans[i];
      const status = await loan.servicing.getRepaymentStatus();
      if (status === 'DEFAULT') {
        defaultedLoans.push(loan);
      }
    }
    return defaultedLoans;
  }

  async getTotalInterestEarned() {
    const loans = this.getLoans();
    let totalInterest = new BigNumber(0);
    for (let i = 0; i < loans.length; i++) {
      const loan = loans[i];
      const interest = await loan.servicing.getInterestEarnedToDate(new Date());

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

  async save() {
    let raw = {};

    Object.keys(this.investments).forEach(function (uuid) {
      raw[uuid] = this.investments[uuid].toJson();
    }.bind(this))

    await fs.outputJson(PORTFOLIO_STORE_FILE, raw);
  }

  getInvestment(uuid) {
    return this.investments[uuid];
  }

  getInvestments() {
    return Object.keys(this.investments);
  }

  async stopWatchingEvents() {
    for (let uuid in this.investments) {
      const investment = this.investments[uuid];
      await investment.stopWatchingEvents();
    }
  }
}

module.exports = Portfolio;
