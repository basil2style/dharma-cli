class Investment {
  constructor(loan) {
    this.loan = loan;
    this.state = null;
    this.investor = null;
    this.bids = [];
    this.events = {};
    this.withdrawn = false;
    this.balance = 0;
    this.amountRepaid = 0;
    this.termBeginDate = null;
    this.status = null;
  }

  getState() {
    return this.state;
  }

  setState(state) {
    this.state = state;
  }

  getBalance() {
    return this.balance;
  }

  setBalance(balance) {
    this.balance = balance;
  }

  setTermBeginDate(date) {
    this.termBeginDate = date;
  }

  addBid(bid) {
    this.bids.push(bid);
  }

  setInvestor(investor) {
    this.investor = investor;
  }

  getInvestor() {
    return this.investor;
  }

  getBids() {
    return this.bids;
  }

  addEvent(eventName, event) {
    this.events[eventName] = event;
  }

  getEvent(eventName) {
    return this.events[eventName];
  }

  setWithdrawn(withdrawn) {
    this.withdrawn = withdrawn;
  }

  getWithdrawn() {
    return this.withdrawn;
  }

  setAmountRepaid(amountRepaid) {
    this.amountRepaid = amountRepaid;
  }

  getAmountRepaid() {
    return this.amountRepaid;
  }

  setStatus(status) {
    this.status = status;
  }

  getStatus() {
    return this.status;
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
      const state = await loan.getState();

      const investment = new Investment(loan);
      investment.setState(state);
      json.bids.forEach((bid) => {
        investment.addBid(bid);
      })

      investment.setWithdrawn(json.withdrawn);
      investment.setBalance(json.balance);
      investment.setInvestor(json.investor);

      resolve(investment);
    });
  }

  toJson() {
    return {
      loan: this.loan.toJson(),
      state: this.state,
      bids: this.bids,
      withdrawn: this.withdrawn,
      balance: this.balance,
      investor: this.investor,
      termBeginDate: this.termBeginDate
    }
  }
}

module.exports = Investment;
