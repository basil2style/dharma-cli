import BidSchema from './schemas/BidSchema';

class Investor {
  constructor(dharma, decisionEngine) {
    this.dharma = dharma;
    this.decisionEngine = decisionEngine;
    this.bids = {}
  }

  static async fromPath(dharma, engineFilePath) {
    try {
      const decisionEngine = await import(engineFilePath);
      return new Investor(dharma, decisionEngine);
    } catch (err) {
      throw new Error("Decision engine file not found.");
    }
  }

  async startDaemon() {
    this.createdEvent = await this.dharma.loans.events.created();
    this.createdEvent.watch(async function(err, result) {
      const loan = await this.dharma.loans.get(result.args.uuid);
      const bid = await this.decisionEngine.decide(loan);
      if (bid) {
        const schema = new BidSchema(this.dharma.web3);
        schema.validate(bid);

        await loan.bid(bid.amount, bid.bidder, bid.minInterestRate);
        const termBeginEvent = await loan.events.termBegin();
        const bidsRejectedEvent = await loan.events.bidsRejected();
        const bidsIgnoredEvent = await loan.events.reviewPeriodCompleted();

        termBeginEvent.watch(this.termBeginCallback(loan.uuid, termBeginEvent))
        bidsRejectedEvent.watch(this.bidsRejectedCallback(loan.uuid, bidsRejectedEvent))
        bidsIgnoredEvent.watch(this.bidsIgnoredCallback(loan.uuid, bidsIgnoredEvent))

        this.bids[loan.uuid] = {
          loan: loan,
          bid: bid
        };
      }
    }.bind(this));
  }

  termBeginCallback(uuid, termBeginEvent) {
    const _this = this;

    return async () => {
      termBeginEvent.stopWatching(async () => {
        const bidObj = _this.bids[uuid];
        const bid = bidObj.bid;
        const loan = bidObj.loan;
        const tokenBalance = await loan.balanceOf(bid.bidder);
        if (tokenBalance.lt(bid.amount)) {
          await loan.withdrawInvestment({ from: bid.bidder })
        }
      })
    };
  }

  bidsRejectedCallback(uuid, bidsRejectedEvent) {
    const _this = this;

    return () => {
      bidsRejectedEvent.stopWatching(async () => {
        const bidObj = _this.bids[uuid];
        const bid = bidObj.bid;
        const loan = bidObj.loan;
        await loan.withdrawInvestment({ from: bid.bidder })
      })
    };
  }

  bidsIgnoredCallback(uuid, bidsIgnoredEvent) {
    const _this = this;

    return () => {
      bidsIgnoredEvent.stopWatching(async () => {
        const bidObj = _this.bids[uuid];
        const bid = bidObj.bid;
        const loan = bidObj.loan;
        await loan.withdrawInvestment({ from: bid.bidder })
      })
    };
  }

  stopDaemon() {

  }

  getPortfolio() {

  }

  collect(uuid) {

  }
}

module.exports = Investor;
