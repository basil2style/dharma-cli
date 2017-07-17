'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Investment = require('./Investment');

var _Investment2 = _interopRequireDefault(_Investment);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _bignumber = require('bignumber.js');

var _bignumber2 = _interopRequireDefault(_bignumber);

var _Util = require('../Util');

var _Util2 = _interopRequireDefault(_Util);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Constants = require('../Constants');

var _Constants2 = _interopRequireDefault(_Constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PORTFOLIO_STORE_FILE = _os2.default.homedir() + '/.dharma/portfolio.json';

var Portfolio = function () {
  function Portfolio(web3) {
    var investments = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Portfolio);

    this.web3 = web3;
    this.investments = investments;
    this.portfolioUpdateCallback = null;
  }

  _createClass(Portfolio, [{
    key: 'addInvestment',
    value: function addInvestment(investment) {
      var uuid = investment.loan.uuid;
      this.investments[uuid] = investment;
    }
  }, {
    key: 'getRiskProfile',
    value: function getRiskProfile() {
      var _this = this;

      var riskTranches = ['0-20', '21-40', '41-60', '61-80', '81-100'];
      var riskProfile = {};

      var _loop = function _loop(i) {
        var valueInvested = new _bignumber2.default(0);
        var decimals = new _bignumber2.default(10 ** 18);
        var trancheWidth = new _bignumber2.default(0.2);
        var defaultRiskMin = trancheWidth.times(i).plus(0.01).times(decimals);
        var defaultRiskMax = trancheWidth.times(i + 1).times(decimals);

        Object.keys(_this.investments).forEach(function (uuid) {
          var investment = _this.investments[uuid];
          if (investment.loan.defaultRisk.gte(defaultRiskMin) && investment.loan.defaultRisk.lte(defaultRiskMax)) {
            valueInvested = valueInvested.plus(investment.balance);
          }
        });

        riskProfile[riskTranches[i]] = valueInvested;
      };

      for (var i = 0; i < 5; i++) {
        _loop(i);
      }

      return riskProfile;
    }
  }, {
    key: 'getTotalCash',
    value: async function getTotalCash() {
      var _this2 = this;

      var investors = {};
      var totalCash = new _bignumber2.default(0);

      Object.keys(this.investments).forEach(function (uuid) {
        var investor = _this2.investments[uuid].investor;
        if (!(investor in investors)) {
          investors[investor] = true;
        }
      });

      var investorList = Object.keys(investors);
      for (var i = 0; i < investorList.length; i++) {
        var cash = await _Util2.default.getBalance(this.web3, investorList[i]);
        totalCash = totalCash.plus(cash);
      }

      return totalCash;
    }
  }, {
    key: 'getTotalValue',
    value: async function getTotalValue() {
      var loans = this.getLoans();
      var promises = loans.map(function (loan) {
        return new Promise(async function (resolve, reject) {
          var balanceRepaid = await loan.amountRepaid();
          resolve(balanceRepaid);
        });
      });

      var amountsRepaid = await Promise.all(promises);
      var totalValue = await this.getTotalCash();
      amountsRepaid.forEach(function (amount) {
        totalValue = totalValue.plus(amount);
      });

      return totalValue;
    }
  }, {
    key: 'getLoans',
    value: function getLoans() {
      var _this3 = this;

      var currentInvestments = _lodash2.default.filter(Object.keys(this.investments), function (uuid) {
        var investment = _this3.investments[uuid];
        if (investment.balance.gt(0)) {
          return true;
        }
      });

      return _lodash2.default.map(currentInvestments, function (uuid) {
        return _this3.investments[uuid].loan;
      });
    }
  }, {
    key: 'getLoansOutstanding',
    value: async function getLoansOutstanding() {
      var loans = this.getLoans();
      var outstandingLoans = [];
      for (var i = 0; i < loans.length; i++) {
        var loan = loans[i];
        var status = await loan.servicing.getRepaymentStatus();
        if (status !== 'REPAID') {
          outstandingLoans.push(loan);
        }
      }
      return outstandingLoans;
    }
  }, {
    key: 'getDelinquentLoans',
    value: async function getDelinquentLoans() {
      var loans = this.getLoans();
      var delinquentLoans = [];
      for (var i = 0; i < loans.length; i++) {
        var loan = loans[i];
        var status = await loan.servicing.getRepaymentStatus();
        if (status === 'DELINQUENT') {
          delinquentLoans.push(loan);
        }
      }
      return delinquentLoans;
    }
  }, {
    key: 'getDefaultedLoans',
    value: async function getDefaultedLoans() {
      var loans = this.getLoans();
      var defaultedLoans = [];
      for (var i = 0; i < loans.length; i++) {
        var loan = loans[i];
        var status = await loan.servicing.getRepaymentStatus();
        if (status === 'DEFAULT') {
          defaultedLoans.push(loan);
        }
      }
      return defaultedLoans;
    }
  }, {
    key: 'getTotalInterestEarned',
    value: async function getTotalInterestEarned() {
      var loans = this.getLoans();
      var totalInterest = new _bignumber2.default(0);
      for (var i = 0; i < loans.length; i++) {
        var loan = loans[i];
        var interest = await loan.servicing.getInterestEarnedToDate(new Date());

        totalInterest = totalInterest.add(interest);
      }
      return totalInterest;
    }
  }, {
    key: 'forEachInvestment',
    value: function forEachInvestment(callback) {
      for (var uuid in this.investments) {
        callback(this.getInvestment(uuid));
      }
    }
  }, {
    key: 'toJson',
    value: function toJson() {
      var raw = {};

      Object.keys(this.investments).forEach(function (uuid) {
        raw[uuid] = this.investments[uuid].toJson();
      }.bind(this));

      return raw;
    }
  }, {
    key: 'save',
    value: async function save() {
      var raw = this.toJson();
      await _fsExtra2.default.outputJson(PORTFOLIO_STORE_FILE, raw);
    }
  }, {
    key: 'getInvestment',
    value: function getInvestment(uuid) {
      return this.investments[uuid];
    }
  }, {
    key: 'getInvestments',
    value: function getInvestments() {
      return Object.keys(this.investments);
    }
  }, {
    key: 'stopWatchingEvents',
    value: async function stopWatchingEvents() {
      for (var uuid in this.investments) {
        var investment = this.getInvestment(uuid);
        // await investment.stopWatchingEvents();
      }
    }
  }], [{
    key: 'load',
    value: async function load(dharma) {
      var raw = void 0;
      try {
        raw = await _fsExtra2.default.readJson(PORTFOLIO_STORE_FILE);
      } catch (err) {
        console.log(err);
        throw new Error('Portfolio store file does not exist.');
      }

      var investments = {};

      var promises = Object.keys(raw).map(async function (uuid) {
        investments[uuid] = await _Investment2.default.fromJson(raw[uuid], dharma);
      }.bind(this));

      await Promise.all(promises);
      return new Portfolio(dharma.web3, investments);
    }
  }]);

  return Portfolio;
}();

module.exports = Portfolio;