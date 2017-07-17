import BidSchema from './schemas/BidSchema';
import {AUCTION_STATE, REVIEW_STATE, ACCEPTED_STATE,
  REJECTED_STATE} from './Constants';
import Portfolio from './models/Portfolio';
import Investment from './models/Investment';
import _ from 'lodash';
import { transformFileSync } from 'babel-core';
import { addLoan, initState } from './actions/actions';

process.on('unhandledRejection', (e) => {
  console.error(e.stack);
})

class Investor {
  constructor(dharma, wallet, DecisionEngine) {
    this.dharma = dharma;
    this.wallet = wallet;
    this.decisionEngine = new DecisionEngine(dharma.web3);
    this.store = null;
  }

  static async fromPath(dharma, wallet, engineFilePath) {
    try {
      const path = process.cwd() + '/' + engineFilePath;
      const {code} = transformFileSync(path);
      const decisionEngine = Investor._requireFromString(code, path);
      return new Investor(dharma, wallet, decisionEngine);
    } catch (err) {
      throw new Error("Decision engine file not found.");
    }
  }

  async startDaemon(store, errorCallback) {
    this.store = store;

    try {
      this.portfolio = await this.loadPortfolio();
    } catch (err) {
      this.portfolio = new Portfolio(store, this.dharma.web3);
    }

    this.store.dispatch(initState(this.portfolio));

    this.createdEvent = await this.dharma.loans.events.created();
    this.createdEvent.watch(async function(err, result) {
      const loan = await this.dharma.loans.get(result.args.uuid);
      const bid = await this.decisionEngine.decide(loan);

      if (bid) {
        bid.bidder = this.wallet.getAddress();
        const schema = new BidSchema(this.dharma.web3);
        try {
          schema.validate(bid);
          await loan.bid(bid.amount, bid.bidder, bid.minInterestRate);
        } catch (err) {
          errorCallback(err);
          return;
        }

        const investment = new Investment(loan);
        investment.addBid(bid);
        investment.setInvestor(bid.bidder);
        investment.setState(AUCTION_STATE);

        this.portfolio.addInvestment(investment)

        this.refreshInvestment(loan.uuid);
      }
    }.bind(this));

    this.portfolio.getInvestments().forEach(async function (uuid) {
      this.refreshInvestment(uuid);
    }.bind(this))
  }

  async stopDaemon() {
    await this.portfolio.stopWatchingEvents();
    await this.savePortfolio();

    await new Promise(function(resolve, reject) {
      this.createdEvent.stopWatching(() => {
        resolve();
      })
    }.bind(this));
  }

  async refreshInvestment(uuid) {
    const investment = this.portfolio.getInvestment(uuid);
    const state = investment.getState();

    switch (state) {
      case AUCTION_STATE:
        await this.setupAuctionStateListeners(investment);
        break;
      case REVIEW_STATE:
        await this.setupReviewStateListeners(investment);
        break;
      case ACCEPTED_STATE:
        await this.refreshAcceptedState(investment);
        break;
      case REJECTED_STATE:
        await this.refreshRejectedState(investment);
        break;
    }
  }

  async setupAuctionStateListeners(investment) {
    const loan = investment.loan;
    const auctionCompletedEvent = await loan.events.auctionCompleted();
    auctionCompletedEvent.watch(() => { this.setupReviewStateListeners(investment) })

    investment.addEvent('auctionCompletedEvent', auctionCompletedEvent);
  }

  async setupReviewStateListeners(investment) {
    const loan = investment.loan;

    const termBeginEvent = await loan.events.termBegin();
    const bidsRejectedEvent = await loan.events.bidsRejected();
    const bidsIgnoredEvent = await loan.events.reviewPeriodCompleted();

    termBeginEvent.watch(this.termBeginCallback(loan.uuid, termBeginEvent))
    bidsRejectedEvent.watch(this.bidsRejectedCallback(loan.uuid, bidsRejectedEvent))
    bidsIgnoredEvent.watch(this.bidsIgnoredCallback(loan.uuid, bidsIgnoredEvent))

    investment.addEvent('termBeginEvent', termBeginEvent);
    investment.addEvent('bidsRejectedEvent', bidsRejectedEvent);
    investment.addEvent('bidsIgnoredEvent', bidsIgnoredEvent);
  }

  async refreshAcceptedState(investment) {
    if (!investment.getWithdrawn()) {
      const bid = investment.getBids()[0];
      const loan = investment.loan;
      const tokenBalance = await loan.balanceOf(bid.bidder);
      if (tokenBalance.lt(bid.amount)) {
        await loan.withdrawInvestment({ from: bid.bidder })

        investment.setWithdrawn(true);
        await this.savePortfolio()
      }
    }
  }

  async refreshRejectedState(investment) {
    if (!investment.getWithdrawn()) {
      const bid = investment.getBids()[0];
      const loan = investment.loan;

      await loan.withdrawInvestment({ from: bid.bidder })

      investment.setWithdrawn(true);
      await this.savePortfolio()
    }
  }

  auctionCompletedCallback(uuid, auctionCompletedEvent) {
    const _this = this;

    return async (err) => {
      auctionCompletedEvent.stopWatching(async () => {
        _this.portfolio.getInvestment(uuid).setState(REVIEW_STATE);
        await _this.savePortfolio()
      })
    };
  }

  termBeginCallback(uuid, termBeginEvent) {
    const _this = this;

    return async (err, result) => {
      let investment = _this.portfolio.getInvestment(uuid);
      termBeginEvent.stopWatching(async () => {
        const bid = investment.getBids()[0];
        const loan = investment.loan;

        const tokenBalance = await loan.balanceOf(bid.bidder);
        investment.setBalance(tokenBalance);

        if (tokenBalance.lt(bid.amount)) {
          await loan.withdrawInvestment({ from: bid.bidder })
          investment.setWithdrawn(true);
        }

        investment.setTermBeginDate((new Date()).toJSON());
        investment.setState(ACCEPTED_STATE);

        _this.store.dispatch(addLoan(investment.loan));

        await _this.savePortfolio();
      })
      investment.getEvent('bidsRejectedEvent').stopWatching(() => {});
      investment.getEvent('bidsIgnoredEvent').stopWatching(() => {});

    };
  }

  bidsRejectedCallback(uuid, bidsRejectedEvent) {
    const _this = this;

    return (err) => {
      const investment = _this.portfolio.getInvestment(uuid);
      bidsRejectedEvent.stopWatching(async () => {
        const bid = investment.getBids()[0];
        const loan = investment.loan;

        await loan.withdrawInvestment({ from: bid.bidder })

        investment.setWithdrawn(true)
        investment.setState(REJECTED_STATE);
        await _this.savePortfolio();
      })
      investment.getEvent('termBeginEvent').stopWatching(() => {});
      investment.getEvent('bidsIgnoredEvent').stopWatching(() => {});
    };
  }

  bidsIgnoredCallback(uuid, bidsIgnoredEvent) {
    const _this = this;

    return (err) => {
      const investment = _this.portfolio.getInvestment(uuid);
      bidsIgnoredEvent.stopWatching(async () => {
        const bid = investment.getBids()[0];
        const loan = investment.loan;
        await loan.withdrawInvestment({ from: bid.bidder })

        investment.setWithdrawn(true);
        investment.setState(REJECTED_STATE);
        await _this.savePortfolio();
      })
      investment.getEvent('termBeginEvent').stopWatching(() => {});
      investment.getEvent('bidsRejectedEvent').stopWatching(() => {});
    };
  }

  async loadPortfolio() {
    try {
      this.portfolio = await Portfolio.load(this.dharma);
    } catch (err) {
      this.portfolio = new Portfolio(this.dharma.web3);
    }

    return this.portfolio;
  }

  async savePortfolio() {
    await this.portfolio.save();
  }

  async collect(uuid) {
    const investment = this.portfolio.getInvestment(uuid);
    await investment.loan.redeemValue(investment.getInvestor());
  }

  static _requireFromString(src, filename) {
    const Module = module.constructor;
    const m = new Module();
    m._compile(src, filename);
    return m.exports;
  }
}

module.exports = Investor;
