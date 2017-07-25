'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LoanContract = require('./contract_wrappers/LoanContract');
var EVENTS = {
  created: 'LoanCreated',
  termBegin: 'LoanTermBegin',
  bidsRejected: 'LoanBidsRejected',
  repayment: 'PeriodicRepayment',
  valueRedeemed: 'ValueRedeemed',
  transfer: 'Transfer',
  approval: 'Approval'
};

var Events = function () {
  function Events(web3, defaultOptions) {
    var _this = this;

    _classCallCheck(this, Events);

    this.web3 = web3;
    this.defaultOptions = defaultOptions || {};
    this.events = {};

    var _loop = function _loop(eventName) {
      _this[eventName] = async function (options, callback) {
        return await _this.getEvent(EVENTS[eventName], options, callback);
      };
    };

    for (var eventName in EVENTS) {
      _loop(eventName);
    }
  }

  _createClass(Events, [{
    key: 'getEvent',
    value: async function getEvent(eventName, options, callback) {
      var contract = await LoanContract.instantiate(this.web3);

      options = options || {};
      Object.assign(options, this.defaultOptions);

      var contractEvent = contract[eventName](options);

      if (callback) {
        contractEvent.watch(callback);
      } else {
        return contractEvent;
      }
    }
  }]);

  return Events;
}();

module.exports = Events;