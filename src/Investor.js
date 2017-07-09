"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BidSchema = require("./schemas/BidSchema");

var _BidSchema2 = _interopRequireDefault(_BidSchema);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Investor = function () {
  function Investor(dharma, decisionEngine) {
    _classCallCheck(this, Investor);

    this.dharma = dharma;
    this.decisionEngine = decisionEngine;
    this.bids = {};
  }

  _createClass(Investor, [{
    key: "startDaemon",
    value: async function startDaemon() {
      this.createdEvent = await this.dharma.loans.events.created();
      this.createdEvent.watch(async function (err, result) {
        var loan = await this.dharma.loans.get(result.args.uuid);
        var bid = await this.decisionEngine.decide(loan);
        if (bid) {
          var schema = new _BidSchema2.default(this.dharma.web3);
          schema.validate(bid);

          await loan.bid(bid.amount, bid.bidder, bid.minInterestRate);
          var termBeginEvent = await loan.events.termBegin();
          var bidsRejectedEvent = await loan.events.bidsRejected();
          var bidsIgnoredEvent = await loan.events.reviewPeriodCompleted();

          termBeginEvent.watch(this.termBeginCallback(loan.uuid, termBeginEvent));
          bidsRejectedEvent.watch(this.bidsRejectedCallback(loan.uuid, bidsRejectedEvent));
          bidsIgnoredEvent.watch(this.bidsIgnoredCallback(loan.uuid, bidsIgnoredEvent));

          this.bids[loan.uuid] = {
            loan: loan,
            bid: bid
          };
        }
      }.bind(this));
    }
  }, {
    key: "termBeginCallback",
    value: function termBeginCallback(uuid, termBeginEvent) {
      var _this = this;

      return async function () {
        termBeginEvent.stopWatching(async function () {
          var bidObj = _this.bids[uuid];
          var bid = bidObj.bid;
          var loan = bidObj.loan;
          var tokenBalance = await loan.balanceOf(bid.bidder);
          if (tokenBalance.lt(bid.amount)) {
            await loan.withdrawInvestment({ from: bid.bidder });
          }
        });
      };
    }
  }, {
    key: "bidsRejectedCallback",
    value: function bidsRejectedCallback(uuid, bidsRejectedEvent) {
      var _this = this;

      return function () {
        bidsRejectedEvent.stopWatching(async function () {
          var bidObj = _this.bids[uuid];
          var bid = bidObj.bid;
          var loan = bidObj.loan;
          await loan.withdrawInvestment({ from: bid.bidder });
        });
      };
    }
  }, {
    key: "bidsIgnoredCallback",
    value: function bidsIgnoredCallback(uuid, bidsIgnoredEvent) {
      var _this = this;

      return function () {
        bidsIgnoredEvent.stopWatching(async function () {
          var bidObj = _this.bids[uuid];
          var bid = bidObj.bid;
          var loan = bidObj.loan;
          await loan.withdrawInvestment({ from: bid.bidder });
        });
      };
    }
  }, {
    key: "stopDaemon",
    value: function stopDaemon() {}
  }, {
    key: "getPortfolio",
    value: function getPortfolio() {}
  }, {
    key: "collect",
    value: function collect(uuid) {}
  }], [{
    key: "fromPath",
    value: async function fromPath(dharma, engineFilePath) {
      try {
        var decisionEngine = await Promise.resolve().then(function () {
          return require("" + engineFilePath);
        });
        return new Investor(dharma, decisionEngine);
      } catch (err) {
        throw new Error("Decision engine file not found.");
      }
    }
  }]);

  return Investor;
}();

module.exports = Investor;