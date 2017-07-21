'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BidSchema = require('./schemas/BidSchema');

var _BidSchema2 = _interopRequireDefault(_BidSchema);

var _Constants = require('./Constants');

var _Portfolio = require('./models/Portfolio');

var _Portfolio2 = _interopRequireDefault(_Portfolio);

var _Investment = require('./models/Investment');

var _Investment2 = _interopRequireDefault(_Investment);

var _Bid = require('./models/Bid');

var _Bid2 = _interopRequireDefault(_Bid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _babelCore = require('babel-core');

var _actions = require('./actions/actions');

var _nodeSchedule = require('node-schedule');

var _nodeSchedule2 = _interopRequireDefault(_nodeSchedule);

var _BidDecorator = require('./decorators/BidDecorator');

var _BidDecorator2 = _interopRequireDefault(_BidDecorator);

var _InvestmentDecorator = require('./decorators/InvestmentDecorator');

var _InvestmentDecorator2 = _interopRequireDefault(_InvestmentDecorator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

process.on('unhandledRejection', function (err) {
  console.log(err);
});

var Investor = function () {
  function Investor(dharma, wallet, DecisionEngine) {
    _classCallCheck(this, Investor);

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

  _createClass(Investor, [{
    key: 'startDaemon',
    value: async function startDaemon(store) {
      var dharma = this.dharma;
      var decisionEngine = this.decisionEngine;

      this.store = store;

      this.store.dispatch((0, _actions.log)('info', "Loading portfolio..."));

      try {
        this.portfolio = await this.loadPortfolio();
      } catch (err) {
        this.store.dispatch((0, _actions.log)('info', "No portfolio found on disk."));
        this.store.dispatch((0, _actions.log)('info', "Creating portfolio..."));
        this.portfolio = new _Portfolio2.default(store, this.dharma.web3);
      }

      this.store.dispatch((0, _actions.log)('success', 'Portfolio loaded.'));

      var initialStateAction = await (0, _actions.initState)(this.portfolio);
      this.store.dispatch(initialStateAction);

      this.store.dispatch((0, _actions.log)('info', "Starting daemon..."));
      this.store.dispatch((0, _actions.log)('info', "Listening for new loan requests..."));

      this.createdEvent = await this.dharma.loans.events.created();
      this.createdEvent.watch(this.loanCreatedListenerCallback);

      this.totalCashListener = this.web3.eth.filter('latest');
      this.totalCashListener.watch(this.totalCashListenerCallback);

      var bidRefreshPromises = Object.keys(this.portfolio.bids).map(this.refreshBidPromise);
      var investmentRefereshPromises = Object.keys(this.portfolio.investments).map(this.refreshInvestmentPromise);

      var refreshPromises = [].concat(_toConsumableArray(bidRefreshPromises), _toConsumableArray(investmentRefereshPromises));
      await Promise.all(refreshPromises);
    }
  }, {
    key: 'stopDaemon',
    value: async function stopDaemon() {
      this.stopRepaymentDateJobs();

      await this.portfolio.stopWatchingEvents();
      await this.savePortfolio();

      this.createdEvent.stopWatching(function () {});
      this.totalCashListener.stopWatching(function () {});
    }
  }, {
    key: 'loanCreatedListenerCallback',
    value: async function loanCreatedListenerCallback(err, result) {
      var loan = await this.dharma.loans.get(result.args.uuid);

      this.store.dispatch((0, _actions.log)('info', "Evaluating loan: " + loan.uuid));

      var bidDecision = await this.decisionEngine.decide(loan);

      if (bidDecision) {
        bidDecision.bidder = this.wallet.getAddress();
        var schema = new _BidSchema2.default(this.dharma.web3);

        var bid = void 0;
        try {
          schema.validate(bidDecision);
          bid = new _Bid2.default(loan, bidDecision.bidder, bidDecision.amount, bidDecision.minInterestRate);

          await loan.bid(bid.amount, bid.bidder, bid.minInterestRate);
        } catch (err) {
          console.log(err);
          return;
        }

        var bidDecorator = new _BidDecorator2.default(bid);
        this.store.dispatch((0, _actions.log)('info', "Bidding " + bidDecorator.amount() + " on loan " + loan.uuid + " minimum interest rate of " + bidDecorator.minInterestRate()));

        this.portfolio.addBid(bid);
        await this.refreshBid(loan.uuid);
      }
    }
  }, {
    key: 'refreshBid',
    value: async function refreshBid(uuid) {
      var bid = this.portfolio.bids[uuid];

      switch (bid.loan.state) {
        case _Constants.AUCTION_STATE:
          await this.setupAuctionStateListeners(bid);
          break;
        case _Constants.REVIEW_STATE:
          await this.setupReviewStateListeners(bid);
          break;
        case _Constants.ACCEPTED_STATE:
          await this.setupAcceptedState(bid);
          break;
        case _Constants.REJECTED_STATE:
          await this.refreshRejectedState(bid);
          break;
      }
    }
  }, {
    key: 'refreshBidPromise',
    value: function refreshBidPromise(uuid) {
      var _this = this;

      var callback = async function callback(resolve, reject) {
        await _this.refreshBid(uuid);
        resolve();
      };

      return new Promise(callback.bind(this));
    }
  }, {
    key: 'refreshInvestment',
    value: async function refreshInvestment(uuid) {
      var investment = this.portfolio.investments[uuid];
      var loan = investment.loan;
      var refundWithdrawn = await loan.isRefundWithdrawn(investment.investor);
      if (!refundWithdrawn) {
        await loan.withdrawInvestment({ from: investment.investor });
      }

      var repaymentEvent = await loan.events.repayment();
      repaymentEvent.watch(this.repaymentCallback(loan.uuid));
      investment.addEvent('repaymentEvent', repaymentEvent);

      this.setupRepaymentDateJobs(investment);
    }
  }, {
    key: 'refreshInvestmentPromise',
    value: function refreshInvestmentPromise(uuid) {
      var _this2 = this;

      var callback = async function callback(resolve, reject) {
        await _this2.refreshInvestment(uuid);
        resolve();
      };

      return new Promise(callback.bind(this));
    }
  }, {
    key: 'setupAuctionStateListeners',
    value: async function setupAuctionStateListeners(bid) {
      var loan = bid.loan;
      var auctionCompletedEvent = await loan.events.auctionCompleted();
      auctionCompletedEvent.watch(function () {
        this.auctionCompletedCallback(loan.uuid)();
      }.bind(this));

      bid.addEvent('auctionCompletedEvent', auctionCompletedEvent);
    }
  }, {
    key: 'setupReviewStateListeners',
    value: async function setupReviewStateListeners(bid) {
      var loan = bid.loan;
      var termBeginEvent = await loan.events.termBegin();
      var bidsRejectedEvent = await loan.events.bidsRejected();
      var bidsIgnoredEvent = await loan.events.reviewPeriodCompleted();

      termBeginEvent.watch(this.reviewPeriodEndedCallback(loan.uuid));
      bidsRejectedEvent.watch(this.reviewPeriodEndedCallback(loan.uuid));
      bidsIgnoredEvent.watch(this.reviewPeriodEndedCallback(loan.uuid));

      bid.addEvent('termBeginEvent', termBeginEvent);
      bid.addEvent('bidsRejectedEvent', bidsRejectedEvent);
      bid.addEvent('bidsIgnoredEvent', bidsIgnoredEvent);
    }
  }, {
    key: 'setupAcceptedState',
    value: async function setupAcceptedState(bid) {
      var loan = bid.loan;

      var tokenBalance = await loan.balanceOf(bid.bidder);
      if (tokenBalance.lt(bid.amount)) {
        await loan.withdrawInvestment({ from: bid.bidder });
        this.store.dispatch((0, _actions.log)('info', 'Withdrawing refunded remainder of bid amount'));
      }

      var investment = new _Investment2.default(loan);
      investment.investor = bid.bidder;
      investment.repaymentStatus = await loan.servicing.getRepaymentStatus();
      investment.balance = tokenBalance;
      investment.amountRepaid = await loan.amountRepaid();

      var investmentDecorator = new _InvestmentDecorator2.default(investment);
      this.store.dispatch((0, _actions.log)('success', 'Won auction for ' + investmentDecorator.balance() + ' tokens in loan ' + loan.uuid + 'at a ' + investmentDecorator.interestRate() + ' interest rate.'));

      this.portfolio.addInvestment(investment);
      await this.refreshInvestment(loan.uuid);

      this.portfolio.removeBid(bid);

      var portfolioSummary = await this.portfolio.getSummary();

      this.store.dispatch((0, _actions.addInvestment)(investment));
      this.store.dispatch((0, _actions.updatePortfolioSummary)(portfolioSummary));
    }
  }, {
    key: 'refreshRejectedState',
    value: async function refreshRejectedState(bid) {
      this.store.dispatch((0, _actions.log)('info', 'Bid for loan ' + bid.loan.uuid + 'rejected.'));
      var refundWithdrawn = await bid.loan.isRefundWithdrawn(bid.bidder);
      if (!refundWithdrawn) {
        await bid.loan.withdrawInvestment({ from: bid.bidder });
        this.store.dispatch((0, _actions.log)('info', 'Withdrawing refunded bid amount.'));
      }
    }
  }, {
    key: 'auctionCompletedCallback',
    value: function auctionCompletedCallback(uuid) {
      var _this3 = this;

      var callback = async function callback(err, result) {
        var bid = _this3.portfolio.bids[uuid];
        bid.events['auctionCompletedEvent'].stopWatching(function () {
          // do something
        });
        _this3.store.dispatch((0, _actions.log)('info', 'Auction completed for loan ' + uuid));
        await _this3.refreshBid(uuid);
      };

      return callback.bind(this);
    }
  }, {
    key: 'reviewPeriodEndedCallback',
    value: function reviewPeriodEndedCallback(uuid) {
      var _this4 = this;

      var callback = async function callback(err, result) {
        var bid = _this4.portfolio.bids[uuid];
        bid.events['termBeginEvent'].stopWatching(function () {});
        bid.events['bidsRejectedEvent'].stopWatching(function () {});
        bid.events['bidsIgnoredEvent'].stopWatching(function () {});
        await _this4.refreshBid(uuid);
      };

      return callback.bind(this);
    }
  }, {
    key: 'repaymentCallback',
    value: function repaymentCallback(uuid) {
      var _this5 = this;

      var callback = async function callback(err, result) {
        var investment = _this5.portfolio.investments[uuid];
        var amountRepaid = await investment.loan.amountRepaid();
        investment.amountRepaid = amountRepaid;
        if (amountRepaid.gte(investment.loan.servicing.totalOwed())) investment.events['repaymentEvent'].stopWatching(function () {});

        _this5.store.dispatch((0, _actions.updateInvestment)(investment));
        _this5.store.dispatch((0, _actions.log)('success', 'Received repayment of ' + _InvestmentDecorator2.default.individualRepayment(result.args.value) + ' for loan ' + uuid));
      };

      return callback.bind(this);
    }
  }, {
    key: 'totalCashListenerCallback',
    value: async function totalCashListenerCallback(err, block) {
      var totalCash = await this.portfolio.getTotalCash();
      this.store.dispatch((0, _actions.updateTotalCash)(totalCash));
    }
  }, {
    key: 'setupRepaymentDateJobs',
    value: function setupRepaymentDateJobs(investment) {
      var repaymentDates = investment.loan.servicing.getRepaymentDates();
      for (var i = 0; i < repaymentDates.length; i++) {
        var date = repaymentDates[i];
        var job = _nodeSchedule2.default.scheduleJob(date, this.repaymentDateCallback(investment));
        this.scheduledJobs.push(job);
      }
    }
  }, {
    key: 'repaymentDateCallback',
    value: function repaymentDateCallback(investment) {
      var _this6 = this;

      var callback = async function callback() {
        var repaymentStatus = await investment.loan.servicing.getRepaymentStatus();
        investment.repaymentStatus = repaymentStatus;

        _this6.store.dispatch((0, _actions.updateInvestment)(investment));
      };

      return callback.bind(this);
    }
  }, {
    key: 'stopRepaymentDateJobs',
    value: function stopRepaymentDateJobs() {
      this.scheduledJobs.forEach(function (job) {
        job.cancel();
      });
      this.scheduledJobs = [];
    }
  }, {
    key: 'loadPortfolio',
    value: async function loadPortfolio() {
      try {
        this.portfolio = await _Portfolio2.default.load(this.dharma);
      } catch (err) {
        this.portfolio = new _Portfolio2.default(this.dharma.web3);
      }

      return this.portfolio;
    }
  }, {
    key: 'savePortfolio',
    value: async function savePortfolio() {
      await this.portfolio.save();
    }
  }, {
    key: 'collect',
    value: async function collect(uuid) {
      var investment = this.portfolio.investments[uuid];
      await investment.loan.redeemValue(investment.investor);
    }
  }], [{
    key: 'fromPath',
    value: async function fromPath(dharma, wallet, engineFilePath) {
      try {
        var path = process.cwd() + '/' + engineFilePath;

        var _transformFileSync = (0, _babelCore.transformFileSync)(path),
            code = _transformFileSync.code;

        var decisionEngine = Investor._requireFromString(code, path);
        return new Investor(dharma, wallet, decisionEngine);
      } catch (err) {
        console.log(err);
        throw new Error("Decision engine file not found.");
      }
    }
  }, {
    key: '_requireFromString',
    value: function _requireFromString(src, filename) {
      var Module = module.constructor;
      var m = new Module();
      m._compile(src, filename);
      return m.exports;
    }
  }]);

  return Investor;
}();

module.exports = Investor;