'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Constants = require('../Constants');

var _Constants2 = _interopRequireDefault(_Constants);

var _bignumber = require('bignumber.js');

var _bignumber2 = _interopRequireDefault(_bignumber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Investment = function () {
  function Investment(loan) {
    _classCallCheck(this, Investment);

    this.loan = loan;
    this.state = _Constants2.default.NULL_STATE;
    this.investor = null;
    this.bids = [];
    this.events = {};
    this.withdrawn = false;
    this.balance = new _bignumber2.default(0);
    this.amountRepaid = new _bignumber2.default(0);
    this.termBeginDate = null;
    this.repaymentStatus = null;
  }

  _createClass(Investment, [{
    key: 'addBid',
    value: function addBid(bid) {
      this.bids.push(bid);
    }
  }, {
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
      var json = {
        loan: this.loan.toJson(),
        state: this.state,
        bids: this.bids,
        withdrawn: this.withdrawn,
        balance: this.balance,
        investor: this.investor,
        termBeginDate: this.termBeginDate,
        amountRepaid: this.amountRepaid,
        repaymentStatus: this.repaymentStatus
      };

      if (this.termBeginDate) {
        json.termBeginTimestamp = this.termBeginDate.getTime();
      }

      return json;
    }
  }], [{
    key: 'fromJson',
    value: function fromJson(json, dharma) {
      return new Promise(async function (resolve, reject) {
        var loan = await dharma.loans.get(json.loan.uuid);
        var investment = new Investment(loan);
        investment.state = await loan.getState();
        investment.investor = json.investor;
        json.bids.forEach(function (bid) {
          investment.addBid(bid);
        });
        investment.withdrawn = json.withdrawn;
        investment.balance = new _bignumber2.default(json.balance);
        investment.amountRepaid = await loan.amountRepaid();
        if (json.termBeginTimestamp) investment.termBeginDate = new Date(json.termBeginTimestamp);
        investment.repaymentStatus = await loan.servicing.getRepaymentStatus();

        resolve(investment);
      });
    }
  }]);

  return Investment;
}();

module.exports = Investment;