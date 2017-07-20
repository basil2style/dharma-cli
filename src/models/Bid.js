'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bignumber = require('bignumber.js');

var _bignumber2 = _interopRequireDefault(_bignumber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Bid = function () {
  function Bid(loan, bidder, amount, minInterestRate) {
    _classCallCheck(this, Bid);

    this.loan = loan;
    this.bidder = bidder;
    this.amount = new _bignumber2.default(amount);
    this.events = {};
    this.minInterestRate = new _bignumber2.default(minInterestRate);
  }

  _createClass(Bid, [{
    key: 'addEvent',
    value: function addEvent(eventName, event) {
      this.events[eventName] = event;
    }
  }, {
    key: 'getEvent',
    value: function getEvent(eventName) {
      return this.events[eventName];
    }
  }, {
    key: 'stopWatchingEvents',
    value: async function stopWatchingEvents() {
      var _this = this;

      var _loop = async function _loop(eventName) {
        var event = _this.events[eventName];
        await new Promise(function (resolve, reject) {
          event.stopWatching(function () {
            resolve();
          });
        });
      };

      for (var eventName in this.events) {
        await _loop(eventName);
      }
    }
  }, {
    key: 'toJson',
    value: function toJson() {
      return {
        loanUuid: this.loan.uuid,
        bidder: this.bidder,
        amount: this.amount,
        minInterestRate: this.minInterestRate,
        state: this.state
      };
    }
  }], [{
    key: 'fromJson',
    value: async function fromJson(json, dharma) {
      var loan = await dharma.loans.get(json.loanUuid);
      var bid = new Bid(loan, json.bidder, json.amount, json.minInterestRate);
      bid.state = json.state;
      return bid;
    }
  }]);

  return Bid;
}();

module.exports = Bid;