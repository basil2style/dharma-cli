'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BidSchema = require('./schemas/BidSchema');

var _BidSchema2 = _interopRequireDefault(_BidSchema);

var _Constants = require('./Constants');

var _Portfolio = require('./models/Portfolio');

var _Portfolio2 = _interopRequireDefault(_Portfolio);

var _Investment = require('./models/Investment');

var _Investment2 = _interopRequireDefault(_Investment);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _babelCore = require('babel-core');

var _actions = require('./actions/actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

process.on('unhandledRejection', function (e) {
  console.error(e.stack);
});

var Investor = function () {
  function Investor(dharma, wallet, DecisionEngine) {
    _classCallCheck(this, Investor);

    this.dharma = dharma;
    this.wallet = wallet;
    this.decisionEngine = new DecisionEngine(dharma.web3);
    this.store = null;
  }

  _createClass(Investor, [{
    key: 'startDaemon',
    value: async function startDaemon(store, errorCallback) {
      this.store = store;

      try {
        this.portfolio = await this.loadPortfolio();
      } catch (err) {
        this.portfolio = new _Portfolio2.default(store, this.dharma.web3);
      }

      this.createdEvent = await this.dharma.loans.events.created();
      this.createdEvent.watch(async function (err, result) {
        var loan = await this.dharma.loans.get(result.args.uuid);
        var bid = await this.decisionEngine.decide(loan);

        if (bid) {
          bid.bidder = this.wallet.getAddress();
          var schema = new _BidSchema2.default(this.dharma.web3);
          try {
            schema.validate(bid);
            await loan.bid(bid.amount, bid.bidder, bid.minInterestRate);
          } catch (err) {
            errorCallback(err);
            return;
          }

          var investment = new _Investment2.default(loan);
          investment.addBid(bid);
          investment.setInvestor(bid.bidder);
          investment.setState(_Constants.AUCTION_STATE);

          this.portfolio.addInvestment(investment);

          this.refreshInvestment(loan.uuid);
        }
      }.bind(this));

      this.portfolio.getInvestments().forEach(async function (uuid) {
        this.refreshInvestment(uuid);
      }.bind(this));
    }
  }, {
    key: 'stopDaemon',
    value: async function stopDaemon() {
      await this.portfolio.stopWatchingEvents();
      await this.savePortfolio();

      await new Promise(function (resolve, reject) {
        this.createdEvent.stopWatching(function () {
          resolve();
        });
      }.bind(this));
    }
  }, {
    key: 'refreshInvestment',
    value: async function refreshInvestment(uuid) {
      var investment = this.portfolio.getInvestment(uuid);
      var state = investment.getState();

      switch (state) {
        case _Constants.AUCTION_STATE:
          await this.setupAuctionStateListeners(investment);
          break;
        case _Constants.REVIEW_STATE:
          await this.setupReviewStateListeners(investment);
          break;
        case _Constants.ACCEPTED_STATE:
          await this.refreshAcceptedState(investment);
          break;
        case _Constants.REJECTED_STATE:
          await this.refreshRejectedState(investment);
          break;
      }
    }
  }, {
    key: 'setupAuctionStateListeners',
    value: async function setupAuctionStateListeners(investment) {
      var _this2 = this;

      var loan = investment.loan;
      var auctionCompletedEvent = await loan.events.auctionCompleted();
      auctionCompletedEvent.watch(function () {
        _this2.setupReviewStateListeners(investment);
      });

      investment.addEvent('auctionCompletedEvent', auctionCompletedEvent);
    }
  }, {
    key: 'setupReviewStateListeners',
    value: async function setupReviewStateListeners(investment) {
      var loan = investment.loan;

      var termBeginEvent = await loan.events.termBegin();
      var bidsRejectedEvent = await loan.events.bidsRejected();
      var bidsIgnoredEvent = await loan.events.reviewPeriodCompleted();

      termBeginEvent.watch(this.termBeginCallback(loan.uuid, termBeginEvent));
      bidsRejectedEvent.watch(this.bidsRejectedCallback(loan.uuid, bidsRejectedEvent));
      bidsIgnoredEvent.watch(this.bidsIgnoredCallback(loan.uuid, bidsIgnoredEvent));

      investment.addEvent('termBeginEvent', termBeginEvent);
      investment.addEvent('bidsRejectedEvent', bidsRejectedEvent);
      investment.addEvent('bidsIgnoredEvent', bidsIgnoredEvent);
    }
  }, {
    key: 'refreshAcceptedState',
    value: async function refreshAcceptedState(investment) {
      if (!investment.getWithdrawn()) {
        var bid = investment.getBids()[0];
        var loan = investment.loan;
        var tokenBalance = await loan.balanceOf(bid.bidder);
        if (tokenBalance.lt(bid.amount)) {
          await loan.withdrawInvestment({ from: bid.bidder });

          investment.setWithdrawn(true);
          await this.savePortfolio();
        }
      }
    }
  }, {
    key: 'refreshRejectedState',
    value: async function refreshRejectedState(investment) {
      if (!investment.getWithdrawn()) {
        var bid = investment.getBids()[0];
        var loan = investment.loan;

        await loan.withdrawInvestment({ from: bid.bidder });

        investment.setWithdrawn(true);
        await this.savePortfolio();
      }
    }
  }, {
    key: 'auctionCompletedCallback',
    value: function auctionCompletedCallback(uuid, auctionCompletedEvent) {
      var _this = this;

      return async function (err) {
        auctionCompletedEvent.stopWatching(async function () {
          _this.portfolio.getInvestment(uuid).setState(_Constants.REVIEW_STATE);
          await _this.savePortfolio();
        });
      };
    }
  }, {
    key: 'termBeginCallback',
    value: function termBeginCallback(uuid, termBeginEvent) {
      var _this = this;

      return async function (err, result) {
        var investment = _this.portfolio.getInvestment(uuid);
        termBeginEvent.stopWatching(async function () {
          var bid = investment.getBids()[0];
          var loan = investment.loan;

          var tokenBalance = await loan.balanceOf(bid.bidder);
          investment.setBalance(tokenBalance);

          if (tokenBalance.lt(bid.amount)) {
            await loan.withdrawInvestment({ from: bid.bidder });
            investment.setWithdrawn(true);
          }

          investment.setTermBeginDate(new Date().toJSON());
          investment.setState(_Constants.ACCEPTED_STATE);

          _this.store.dispatch((0, _actions.addLoan)(investment.loan));

          await _this.savePortfolio();
        });
        investment.getEvent('bidsRejectedEvent').stopWatching(function () {});
        investment.getEvent('bidsIgnoredEvent').stopWatching(function () {});
      };
    }
  }, {
    key: 'bidsRejectedCallback',
    value: function bidsRejectedCallback(uuid, bidsRejectedEvent) {
      var _this = this;

      return function (err) {
        var investment = _this.portfolio.getInvestment(uuid);
        bidsRejectedEvent.stopWatching(async function () {
          var bid = investment.getBids()[0];
          var loan = investment.loan;

          await loan.withdrawInvestment({ from: bid.bidder });

          investment.setWithdrawn(true);
          investment.setState(_Constants.REJECTED_STATE);
          await _this.savePortfolio();
        });
        investment.getEvent('termBeginEvent').stopWatching(function () {});
        investment.getEvent('bidsIgnoredEvent').stopWatching(function () {});
      };
    }
  }, {
    key: 'bidsIgnoredCallback',
    value: function bidsIgnoredCallback(uuid, bidsIgnoredEvent) {
      var _this = this;

      return function (err) {
        var investment = _this.portfolio.getInvestment(uuid);
        bidsIgnoredEvent.stopWatching(async function () {
          var bid = investment.getBids()[0];
          var loan = investment.loan;
          await loan.withdrawInvestment({ from: bid.bidder });

          investment.setWithdrawn(true);
          investment.setState(_Constants.REJECTED_STATE);
          await _this.savePortfolio();
        });
        investment.getEvent('termBeginEvent').stopWatching(function () {});
        investment.getEvent('bidsRejectedEvent').stopWatching(function () {});
      };
    }
  }, {
    key: 'loadPortfolio',
    value: async function loadPortfolio() {
      try {
        this.portfolio = await _Portfolio2.default.load(this.dharma);
      } catch (err) {
        this.portfolio = new _Portfolio2.default(this.dharma.web3);
      }

      this.portfolio.forEachInvestment(function (investment) {
        this.store.dispatch((0, _actions.addLoan)(investment.loan));
      }.bind(this));

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
      var portfolio = void 0;
      if (!this.portfolio) {
        portfolio = await this.loadPortfolio();
      } else {
        portfolio = this.portfolio;
      }

      var investment = portfolio.getInvestment(uuid);
      await investment.loan.redeemValue(investment.getInvestor());
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