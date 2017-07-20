import BigNumber from 'bignumber.js';

class Bid {
  constructor(loan, bidder, amount, minInterestRate) {
    this.loan = loan;
    this.bidder = bidder;
    this.amount = new BigNumber(amount);
    this.events = {};
    this.minInterestRate = new BigNumber(minInterestRate);
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

  toJson() {
    return {
      loanUuid: this.loan.uuid,
      bidder: this.bidder,
      amount: this.amount,
      minInterestRate: this.minInterestRate,
      state: this.state
    }
  }

  static async fromJson(json, dharma) {
    const loan = await dharma.loans.get(json.loanUuid);
    let bid = new Bid(loan, json.bidder, json.amount, json.minInterestRate);
    bid.state = json.state;
    return bid;
  }
}

module.exports = Bid;
