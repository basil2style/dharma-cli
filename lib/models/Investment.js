import Constants from '../Constants';
import BigNumber from 'bignumber.js';

class Investment {
  constructor(loan) {
    this.loan = loan;
    this.state = Constants.NULL_STATE;
    this.investor = null;
    this.bids = [];
    this.events = {};
    this.withdrawn = false;
    this.balance = new BigNumber(0);
    this.amountRepaid = new BigNumber(0);
    this.termBeginDate = null;
    this.repaymentStatus = null;
  }

  addBid(bid) {
    this.bids.push(bid);
  }

  addEvent(eventName, event) {
    this.events[eventName] = event;
  }

  getEvent(eventName) {
    return this.events[eventName];
  }

  async stopWatchingEvents() {
    for (let eventName in this.events) {
      const event = this.events[eventName];
      await new Promise(function(resolve, reject) {
        event.stopWatching(() => {
          resolve();
        })
      });
    }
  }

  static fromJson(json, dharma) {
    return new Promise(async function(resolve, reject) {
      const loan = await dharma.loans.get(json.loan.uuid);
      const investment = new Investment(loan);
      investment.state = await loan.getState();
      investment.investor = json.investor;
      json.bids.forEach((bid) => {
        investment.addBid(bid);
      })
      investment.withdrawn = json.withdrawn;
      investment.balance = new BigNumber(json.balance);
      investment.amountRepaid = await loan.amountRepaid();
      if (json.termBeginTimestamp)
        investment.termBeginDate = new Date(json.termBeginTimestamp);
      investment.repaymentStatus = await loan.servicing.getRepaymentStatus();

      resolve(investment);
    });
  }

  toJson() {
    let json =  {
      loan: this.loan.toJson(),
      state: this.state,
      bids: this.bids,
      withdrawn: this.withdrawn,
      balance: this.balance,
      investor: this.investor,
      termBeginDate: this.termBeginDate,
      amountRepaid: this.amountRepaid,
      repaymentStatus: this.repaymentStatus
    }

    if (this.termBeginDate) {
      json.termBeginTimestamp = this.termBeginDate.getTime()
    }

    return json;
  }
}

module.exports = Investment;
