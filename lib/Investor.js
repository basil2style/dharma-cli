import BidSchema from './schemas/BidSchema';
import {AUCTION_STATE, REVIEW_STATE, ACCEPTED_STATE,
  REJECTED_STATE, REPAYMENT_STATUS} from './Constants';
import Portfolio from './models/Portfolio';
import Investment from './models/Investment';
import Bid from './models/Bid';
import _ from 'lodash';
import { transformFileSync } from 'babel-core';
import { addInvestment, initState, log, updateInvestment, updateTotalCash,
  updatePortfolioSummary } from './actions/actions';
import scheduler from 'node-schedule';
import BidDecorator from './decorators/BidDecorator';
import InvestmentDecorator from './decorators/InvestmentDecorator';

process.on('unhandledRejection', (err) => {
  console.log(err);
})

class Investor {
  constructor(dharma, wallet, DecisionEngine) {
    this.dharma = dharma;
    this.web3 = dharma.web3;
    this.wallet = wallet;
    this.decisionEngine = new DecisionEngine(dharma.web3);
    this.store = null;
    this.scheduledJobs = [];

    this.refreshBid = this.refreshBid.bind(this);
    this.refreshInvestment = this.refreshInvestment.bind(this);
    this.refreshBidPromise = this.refreshBidPromise.bind(this);
    this.refreshInvestmentPromise = this.refreshInvestmentPromise.bind(this);


    this.loanCreatedListenerCallback = this.loanCreatedListenerCallback.bind(this);
    this.totalCashListenerCallback = this.totalCashListenerCallback.bind(this);
  }


  static async fromPath(dharma, wallet, engineFilePath) {
    try {
      const path = process.cwd() + '/' + engineFilePath;
      const {code} = transformFileSync(path);
      const decisionEngine = Investor._requireFromString(code, path);
      return new Investor(dharma, wallet, decisionEngine);
    } catch (err) {
      console.log(err);
      throw new Error("Decision engine file not found.");
    }
  }

  async startDaemon(store) {
    const dharma = this.dharma;
    const decisionEngine = this.decisionEngine;

    this.store = store;

    this.store.dispatch(log('info', "Loading portfolio..."));

    try {
      this.portfolio = await this.loadPortfolio();
    } catch (err) {
      this.store.dispatch(log('info', "No portfolio found on disk."));
      this.store.dispatch(log('info', "Creating portfolio..."));
      this.portfolio = new Portfolio(store, this.dharma.web3);
    }

    this.store.dispatch(log('success', 'Portfolio loaded.'));

    const initialStateAction = await initState(this.portfolio);
    this.store.dispatch(initialStateAction);

    this.store.dispatch(log('info', "Starting daemon..."));
    this.store.dispatch(log('info', "Listening for new loan requests..."));

    this.createdEvent = await this.dharma.loans.events.created();
    this.createdEvent.watch(this.loanCreatedListenerCallback);

    this.totalCashListener = this.web3.eth.filter('latest');
    this.totalCashListener.watch(this.totalCashListenerCallback);

    const bidRefreshPromises =
      Object.keys(this.portfolio.bids).map(this.refreshBidPromise);
    const investmentRefereshPromises =
      Object.keys(this.portfolio.investments).map(this.refreshInvestmentPromise);

    const refreshPromises = [ ...bidRefreshPromises,
      ...investmentRefereshPromises];
    await Promise.all(refreshPromises);
  }

  async stopDaemon() {
    this.stopRepaymentDateJobs();

    await this.portfolio.stopWatchingEvents();
    await this.savePortfolio();

    this.createdEvent.stopWatching(() => {})
    this.totalCashListener.stopWatching(() => {})
  }

  async loanCreatedListenerCallback(err, result) {
    const loan = await this.dharma.loans.get(result.args.uuid);

    this.store.dispatch(log('info', "Evaluating loan: " + loan.uuid));

    const bidDecision = await this.decisionEngine.decide(loan);

    if (bidDecision) {
      bidDecision.bidder = this.wallet.getAddress();
      const schema = new BidSchema(this.dharma.web3);

      let bid;
      try {
        schema.validate(bidDecision);
        bid = new Bid(loan, bidDecision.bidder, bidDecision.amount,
           bidDecision.minInterestRate);

        await loan.bid(bid.amount, bid.bidder, bid.minInterestRate);
      } catch (err) {
        console.log(err);
        return;
      }

      const bidDecorator = new BidDecorator(bid);
      this.store.dispatch(log('info', "Bidding " + bidDecorator.amount() +
        " on loan " + loan.uuid + " minimum interest rate of " +
        bidDecorator.minInterestRate()));

      this.portfolio.addBid(bid)
      await this.refreshBid(loan.uuid);
    }
  }

  async refreshBid(uuid) {
    const bid = this.portfolio.bids[uuid];

    switch (bid.loan.state) {
      case AUCTION_STATE:
        await this.setupAuctionStateListeners(bid);
        break;
      case REVIEW_STATE:
        await this.setupReviewStateListeners(bid);
        break;
      case ACCEPTED_STATE:
        await this.setupAcceptedState(bid);
        break;
      case REJECTED_STATE:
        await this.refreshRejectedState(bid);
        break;
    }
  }

  refreshBidPromise(uuid) {
    let callback = async (resolve, reject) => {
      await this.refreshBid(uuid);
      resolve();
    }

    return new Promise(callback.bind(this));
  }

  async refreshInvestment(uuid) {
    const investment = this.portfolio.investments[uuid];
    const loan = investment.loan;
    const refundWithdrawn =
      await loan.isRefundWithdrawn(investment.investor);
    if (!refundWithdrawn) {
      await loan.withdrawInvestment({ from: investment.investor })
    }

    const repaymentEvent = await loan.events.repayment();
    repaymentEvent.watch(this.repaymentCallback(loan.uuid));
    investment.addEvent('repaymentEvent', repaymentEvent);

    this.setupRepaymentDateJobs(investment);
  }

  refreshInvestmentPromise(uuid) {
    let callback = async (resolve, reject) => {
      await this.refreshInvestment(uuid);
      resolve();
    }

    return new Promise(callback.bind(this));
  }

  async setupAuctionStateListeners(bid) {
    const loan = bid.loan;
    const auctionCompletedEvent = await loan.events.auctionCompleted();
    auctionCompletedEvent.watch(function () {
      this.auctionCompletedCallback(loan.uuid)();
    }.bind(this));

    bid.addEvent('auctionCompletedEvent', auctionCompletedEvent);
  }

  async setupReviewStateListeners(bid) {
    const loan = bid.loan;
    const termBeginEvent = await loan.events.termBegin();
    const bidsRejectedEvent = await loan.events.bidsRejected();
    const bidsIgnoredEvent = await loan.events.reviewPeriodCompleted();

    termBeginEvent.watch(this.reviewPeriodEndedCallback(loan.uuid))
    bidsRejectedEvent.watch(this.reviewPeriodEndedCallback(loan.uuid))
    bidsIgnoredEvent.watch(this.reviewPeriodEndedCallback(loan.uuid))

    bid.addEvent('termBeginEvent', termBeginEvent);
    bid.addEvent('bidsRejectedEvent', bidsRejectedEvent);
    bid.addEvent('bidsIgnoredEvent', bidsIgnoredEvent);
  }

  async setupAcceptedState(bid) {
    const loan = bid.loan;

    const tokenBalance = await loan.balanceOf(bid.bidder);
    if (tokenBalance.lt(bid.amount)) {
      await loan.withdrawInvestment({ from: bid.bidder })
      this.store.dispatch(log('info', 'Withdrawing refunded remainder of bid amount'))
    }

    let investment = new Investment(loan);
    investment.investor = bid.bidder;
    investment.repaymentStatus = await loan.servicing.getRepaymentStatus()
    investment.balance = tokenBalance;
    investment.amountRepaid = await loan.amountRepaid();

    const investmentDecorator = new InvestmentDecorator(investment);
    this.store.dispatch(log('success', 'Won auction for ' + investmentDecorator.balance() +
      ' tokens in loan ' + loan.uuid + 'at a ' + investmentDecorator.interestRate() +
      ' interest rate.'))

    this.portfolio.addInvestment(investment);
    await this.refreshInvestment(loan.uuid);

    this.portfolio.removeBid(bid);

    const portfolioSummary = await this.portfolio.getSummary();

    this.store.dispatch(addInvestment(investment));
    this.store.dispatch(updatePortfolioSummary(portfolioSummary))
  }

  async refreshRejectedState(bid) {
    this.store.dispatch(log('info', 'Bid for loan ' + bid.loan.uuid + 'rejected.'))
    const refundWithdrawn = await bid.loan.isRefundWithdrawn(bid.bidder);
    if (!refundWithdrawn) {
      await bid.loan.withdrawInvestment({ from: bid.bidder })
      this.store.dispatch(log('info', 'Withdrawing refunded bid amount.'))
    }
  }

  auctionCompletedCallback(uuid) {
    const callback = async (err, result) => {
      let bid = this.portfolio.bids[uuid];
      bid.events['auctionCompletedEvent'].stopWatching(() => {
        // do something
      })
      this.store.dispatch(log('info', 'Auction completed for loan ' + uuid));
      await this.refreshBid(uuid);
    }

    return callback.bind(this);
  }

  reviewPeriodEndedCallback(uuid) {
    const callback = async (err, result) => {
      let bid = this.portfolio.bids[uuid];
      bid.events['termBeginEvent'].stopWatching(() => {})
      bid.events['bidsRejectedEvent'].stopWatching(() => {});
      bid.events['bidsIgnoredEvent'].stopWatching(() => {});
      await this.refreshBid(uuid);
    };

    return callback.bind(this);
  }

  repaymentCallback(uuid) {
    const callback = async (err, result) => {
      const investment = this.portfolio.investments[uuid];
      const amountRepaid = await investment.loan.amountRepaid();
      investment.amountRepaid = amountRepaid;
      if (amountRepaid.gte(investment.loan.servicing.totalOwed()))
        investment.events['repaymentEvent'].stopWatching(() => {});

      this.store.dispatch(updateInvestment(investment));
      this.store.dispatch(log('success', 'Received repayment of ' +
        InvestmentDecorator.individualRepayment(result.args.value) +
        ' for loan ' + uuid));
    }

    return callback.bind(this);
  }

  async totalCashListenerCallback(err, block) {
    const totalCash = await this.portfolio.getTotalCash();
    this.store.dispatch(updateTotalCash(totalCash))
  }

  setupRepaymentDateJobs(investment) {
    const repaymentDates = investment.loan.servicing.getRepaymentDates();
    for (let i = 0; i < repaymentDates.length; i++)  {
      const date = repaymentDates[i];
      const job = scheduler.scheduleJob(date,
        this.repaymentDateCallback(investment))
      this.scheduledJobs.push(job);
    }
  }

  repaymentDateCallback(investment) {
    const callback = async () => {
      const repaymentStatus =
        await investment.loan.servicing.getRepaymentStatus()
      investment.repaymentStatus = repaymentStatus;

      this.store.dispatch(updateInvestment(investment));
    }

    return callback.bind(this);
  }

  stopRepaymentDateJobs() {
    this.scheduledJobs.forEach((job) => {
      job.cancel();
    })
    this.scheduledJobs = [];
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
    const investment = this.portfolio.investments[uuid];
    await investment.loan.redeemValue(investment.investor);
  }

  static _requireFromString(src, filename) {
    const Module = module.constructor;
    const m = new Module();
    m._compile(src, filename);
    return m.exports;
  }
}

module.exports = Investor;
