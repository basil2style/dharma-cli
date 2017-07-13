'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BidSchema = require('./schemas/BidSchema');

var _BidSchema2 = _interopRequireDefault(_BidSchema);

var _Constants = require('./Constants');

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _babelCore = require('babel-core');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Investor = function () {
  function Investor(dharma, wallet, DecisionEngine) {
    _classCallCheck(this, Investor);

    this.dharma = dharma;
    this.decisionEngine = new DecisionEngine(dharma.web3, wallet);
    this.portfolioStoreFile = _os2.default.homedir() + '/.dharma/portfolio.json';
    this.portfolio = {};
  }

  _createClass(Investor, [{
    key: 'startDaemon',
    value: async function startDaemon(errorCallback) {
      try {
        this.portfolio = await this.loadPortfolio();
      } catch (err) {
        this.portfolio = {};
      }

      this.createdEvent = await this.dharma.loans.events.created();
      this.createdEvent.watch(async function (err, result) {
        var loan = await this.dharma.loans.get(result.args.uuid);
        var bid = await this.decisionEngine.decide(loan);

        if (bid) {
          var schema = new _BidSchema2.default(this.dharma.web3);
          console.log(errorCallback);
          console.log("about to bid");
          try {
            schema.validate(bid);
            await loan.bid(bid.amount, bid.bidder, bid.minInterestRate);
          } catch (err) {
            console.log(err);
            console.log(errorCallback);
            errorCallback(err);
            return;
          }
          console.log('made it here');
          this.portfolio[loan.uuid] = {
            loan: loan,
            bid: bid,
            state: _Constants.AUCTION_STATE
          };

          this.refreshInvestment(loan.uuid);
        }
      }.bind(this));

      Object.keys(this.portfolio).forEach(async function (uuid) {
        this.refreshInvestment(uuid, this.portfolio[uuid].state);
      }.bind(this));
    }
  }, {
    key: 'stopDaemon',
    value: async function stopDaemon() {
      await this.savePortfolio();
      this.dharma.web3.reset(function () {});
    }
  }, {
    key: 'refreshInvestment',
    value: async function refreshInvestment(uuid) {
      var loan = this.portfolio[uuid].loan;
      var state = this.portfolio[uuid].state;

      switch (state) {
        case _Constants.AUCTION_STATE:
          await this.setupAuctionStateListeners(loan);
          break;
        case _Constants.REVIEW_STATE:
          await this.setupReviewStateListeners(loan);
          break;
        case _Constants.ACCEPTED_STATE:
          await this.refreshAcceptedState(loan);
          break;
        case _Constants.REJECTED_STATE:
          await this.refreshRejectedState(loan);
          break;
      }
    }
  }, {
    key: 'setupAuctionStateListeners',
    value: async function setupAuctionStateListeners(loan) {
      var _this2 = this;

      var auctionCompletedEvent = await loan.events.auctionCompleted();
      auctionCompletedEvent.watch(function () {
        _this2.setupReviewStateListeners(loan);
      });

      this.portfolio[loan.uuid].auctionCompletedEvent = auctionCompletedEvent;

      this.setupReviewStateListeners(loan);
    }
  }, {
    key: 'setupReviewStateListeners',
    value: async function setupReviewStateListeners(loan) {
      var termBeginEvent = await loan.events.termBegin();
      var bidsRejectedEvent = await loan.events.bidsRejected();
      var bidsIgnoredEvent = await loan.events.reviewPeriodCompleted();

      termBeginEvent.watch(this.termBeginCallback(loan.uuid, termBeginEvent));
      bidsRejectedEvent.watch(this.bidsRejectedCallback(loan.uuid, bidsRejectedEvent));
      bidsIgnoredEvent.watch(this.bidsIgnoredCallback(loan.uuid, bidsIgnoredEvent));

      this.portfolio[loan.uuid].termBeginEvent = termBeginEvent;
      this.portfolio[loan.uuid].bidsRejectedEvent = bidsRejectedEvent;
      this.portfolio[loan.uuid].bidsIgnoredEvent = bidsIgnoredEvent;
    }
  }, {
    key: 'refreshAcceptedState',
    value: async function refreshAcceptedState(loan) {
      if (!this.portfolio[loan.uuid].refundWithdrawn) {
        var investment = this.portfolio[_loan.uuid];
        var bid = investment.bid;
        var _loan = investment.loan;
        var tokenBalance = await _loan.balanceOf(bid.bidder);
        if (tokenBalance.lt(bid.amount)) {
          await _loan.withdrawInvestment({ from: bid.bidder });

          this.portfolio[_loan.uuid].refundWithdrawn = true;
          await this.savePortfolio();
        }
      }
    }
  }, {
    key: 'refreshRejectedState',
    value: async function refreshRejectedState(loan) {
      if (!this.portfolio[loan.uuid].refundWithdrawn) {
        var investment = this.portfolio[loan.uuid];
        var bid = investment.bid;

        await loan.withdrawInvestment({ from: bid.bidder });

        this.portfolio[loan.uuid].refundWithdrawn = true;
        await this.savePortfolio();
      }
    }
  }, {
    key: 'auctionCompletedCallback',
    value: function auctionCompletedCallback(uuid, auctionCompletedEvent) {
      var _this = this;

      return async function (err) {
        auctionCompletedEvent.stopWatching(async function () {
          _this.portfolio[uuid].state = _Constants.REVIEW_STATE;
          await _this.savePortfolio();
        });
      };
    }
  }, {
    key: 'termBeginCallback',
    value: function termBeginCallback(uuid, termBeginEvent) {
      var _this = this;

      return async function (err, result) {
        termBeginEvent.stopWatching(async function () {
          var investment = _this.portfolio[uuid];
          var bid = investment.bid;
          var loan = investment.loan;
          var tokenBalance = await loan.balanceOf(bid.bidder);
          _this.portfolio[uuid].balance = tokenBalance;

          if (tokenBalance.lt(bid.amount)) {
            await loan.withdrawInvestment({ from: bid.bidder });
            _this.portfolio[uuid].refundWithdrawn = true;
          }

          _this.portfolio[uuid].state = _Constants.ACCEPTED_STATE;
          await _this.savePortfolio();
        });
        _this.portfolio[uuid].bidsRejectedEvent.stopWatching(function () {});
        _this.portfolio[uuid].bidsIgnoredEvent.stopWatching(function () {});
      };
    }
  }, {
    key: 'bidsRejectedCallback',
    value: function bidsRejectedCallback(uuid, bidsRejectedEvent) {
      var _this = this;

      return function (err) {
        bidsRejectedEvent.stopWatching(async function () {
          var investment = _this.portfolio[uuid];
          var bid = investment.bid;
          var loan = investment.loan;

          await loan.withdrawInvestment({ from: bid.bidder });

          _this.portfolio[loan.uuid].refundWithdrawn = true;
          _this.portfolio[uuid].state = _Constants.REJECTED_STATE;
          await _this.savePortfolio();
        });
        _this.portfolio[uuid].termBeginEvent.stopWatching(function () {});
        _this.portfolio[uuid].bidsIgnoredEvent.stopWatching(function () {});
      };
    }
  }, {
    key: 'bidsIgnoredCallback',
    value: function bidsIgnoredCallback(uuid, bidsIgnoredEvent) {
      var _this = this;

      return function (err) {
        bidsIgnoredEvent.stopWatching(async function () {
          var investment = _this.portfolio[uuid];
          var bid = investment.bid;
          var loan = investment.loan;
          await loan.withdrawInvestment({ from: bid.bidder });

          _this.portfolio[loan.uuid].refundWithdrawn = true;
          _this.portfolio[uuid].state = _Constants.REJECTED_STATE;
          await _this.savePortfolio();
        });
        _this.portfolio[uuid].termBeginEvent.stopWatching(function () {});
        _this.portfolio[uuid].bidsRejectedEvent.stopWatching(function () {});
      };
    }
  }, {
    key: 'loadPortfolio',
    value: async function loadPortfolio() {
      var portfolio = void 0;
      try {
        portfolio = await _fsExtra2.default.readJson(this.portfolioStoreFile);
      } catch (err) {
        throw new Error('Portfolio store file does not exist.');
      }

      var promises = Object.keys(portfolio).map(function (uuid) {
        return new Promise(async function (resolve, reject) {
          portfolio[uuid].loan = await this.dharma.loans.get(uuid);
          portfolio[uuid].state = await portfolio[uuid].loan.getState();
          resolve();
        }.bind(this));
      }.bind(this));

      await Promise.all(promises);

      return portfolio;
    }
  }, {
    key: 'savePortfolio',
    value: async function savePortfolio() {
      var portfolio = {};

      Object.keys(this.portfolio).forEach(function (uuid) {
        var investment = _lodash2.default.omit(this.portfolio[uuid], 'loan', 'termBeginEvent', 'bidsRejectedEvent', 'bidsIgnoredEvent', 'auctionCompletedEvent');

        portfolio[uuid] = _lodash2.default.cloneDeep(investment);
      }.bind(this));

      await _fsExtra2.default.outputJson(this.portfolioStoreFile, portfolio);
    }
  }, {
    key: 'collect',
    value: async function collect(uuid) {
      var portfolio = void 0;
      if (_lodash2.default.isEqual(this.portfolio, {})) {
        portfolio = await this.loadPortfolio();
      } else {
        portfolio = this.portfolio;
      }

      var investment = portfolio[uuid];
      await investment.loan.redeemValue(investment.bid.bidder, { from: investment.bid.bidder });
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