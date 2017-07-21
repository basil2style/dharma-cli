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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PORTFOLIO_STORE_FILE = _os2.default.homedir() + '/.dharma/portfolio.json';

var Portfolio = function () {
  function Portfolio(web3) {
    var investments = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var bids = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, Portfolio);

    this.web3 = web3;
    this.investments = investments;
    this.bids = bids;
  }

  _createClass(Portfolio, [{
    key: 'addBid',
    value: function addBid(bid) {
      var uuid = bid.loan.uuid;
      this.bids[uuid] = bid;
    }
  }, {
    key: 'removeBid',
    value: function removeBid(bid) {
      var uuid = bid.loan.uuid;
      delete this.bids[uuid];
    }
  }, {
    key: 'addInvestment',
    value: function addInvestment(investment) {
      var uuid = investment.loan.uuid;
      this.investments[uuid] = investment;
    }
  }, {
    key: 'getSummary',
    value: async function getSummary() {
      var principalOutstanding = await this.getTotalOutstandingPrincipal();
      var principalCollected = await this.getTotalCollectedPrincipal();
      var interestCollected = await this.getTotalCollectedInterest();
      var cash = await this.getTotalCash();
      var defaulted = await this.getTotalDefaultedValue();

      var summary = {
        principalOutstanding: principalOutstanding,
        principalCollected: principalCollected,
        interestCollected: interestCollected,
        totalCash: cash,
        defaultedValue: defaulted
      };

      return summary;
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
    key: 'getInvestments',
    value: function getInvestments() {
      var _this = this;

      var currentInvestments = _lodash2.default.filter(Object.keys(this.investments), function (uuid) {
        var investment = _this.investments[uuid];
        var balance = new _bignumber2.default(investment.balance);
        if (balance.gt(0)) {
          return true;
        }
      });

      return _lodash2.default.map(currentInvestments, function (uuid) {
        return _this.investments[uuid];
      });
    }
  }, {
    key: 'getInvestmentsOutstanding',
    value: async function getInvestmentsOutstanding() {
      var investments = this.getInvestments();
      var outstandingInvestments = [];
      for (var i = 0; i < investments.length; i++) {
        var investment = investments[i];
        var status = await investment.loan.servicing.getRepaymentStatus();
        if (status !== 'REPAID') {
          outstandingInvestments.push(investment);
        }
      }
      return outstandingInvestments;
    }
  }, {
    key: 'getTotalPrincipal',
    value: async function getTotalPrincipal() {
      var investmentsOutstanding = await this.getInvestmentsOutstanding();

      var totalPrincipal = new _bignumber2.default(0);
      for (var i = 0; i < investmentsOutstanding.length; i++) {
        var investment = investmentsOutstanding[i];
        totalPrincipal = totalPrincipal.plus(investment.balance);
      }

      return totalPrincipal;
    }
  }, {
    key: 'getTotalCollectedPrincipal',
    value: async function getTotalCollectedPrincipal() {
      var investmentsOutstanding = await this.getInvestmentsOutstanding();

      var totalCollectedPrincipal = new _bignumber2.default(0);
      for (var i = 0; i < investmentsOutstanding.length; i++) {
        var investment = investmentsOutstanding[i];
        var _loan = investment.loan;
        var totalPrincipalRepaid = await _loan.servicing.getPrincipalRepaidToDate();
        var investorsPrincipalRepaid = totalPrincipalRepaid.div(_loan.principal).times(investment.balance);
        totalCollectedPrincipal = totalCollectedPrincipal.plus(investorsPrincipalRepaid);
      }

      return totalCollectedPrincipal;
    }
  }, {
    key: 'getTotalCollectedInterest',
    value: async function getTotalCollectedInterest() {
      var investmentsOutstanding = await this.getInvestmentsOutstanding();

      var totalCollectedInterest = new _bignumber2.default(0);
      for (var i = 0; i < investmentsOutstanding.length; i++) {
        var investment = investmentsOutstanding[i];
        var _loan2 = investment.loan;
        var interestEarned = await _loan2.servicing.getInterestRepaidToDate();
        var investorsInterestCollected = interestEarned.div(_loan2.principal).times(investment.balance);
        totalCollectedInterest = totalCollectedInterest.plus(investorsInterestCollected);
      }

      return totalCollectedInterest;
    }
  }, {
    key: 'getTotalOutstandingPrincipal',
    value: async function getTotalOutstandingPrincipal() {
      var totalPrincipal = await this.getTotalPrincipal();
      var totalCollectedPrincipal = await this.getTotalCollectedPrincipal();

      return totalPrincipal.minus(totalCollectedPrincipal);
    }
  }, {
    key: 'getDelinquentInvestments',
    value: async function getDelinquentInvestments() {
      var investments = this.getInvestments();
      var delinquentInvestments = [];
      for (var i = 0; i < investments.length; i++) {
        var investment = investments[i];
        var status = await investment.loan.servicing.getRepaymentStatus();
        if (status === 'DELINQUENT') {
          delinquentInvestments.push(loan);
        }
      }
      return delinquentInvestments;
    }
  }, {
    key: 'getDefaultedInvestments',
    value: async function getDefaultedInvestments() {
      var investments = this.getInvestments();
      var defaultedInvestments = [];
      for (var i = 0; i < investments.length; i++) {
        var investment = investments[i];
        var status = await investment.loan.servicing.getRepaymentStatus();
        if (status === 'DEFAULT') {
          defaultedInvestments.push(loan);
        }
      }
      return defaultedInvestments;
    }
  }, {
    key: 'getTotalDefaultedValue',
    value: async function getTotalDefaultedValue() {
      var defaultedInvestments = await this.getDefaultedInvestments();
      var totalValue = new _bignumber2.default(0);
      for (var i = 0; i < defaultedInvestments.length; i++) {
        var investment = defaultedInvestments[i];
        var _loan3 = investment.loan;
        var totalRepaid = await _loan3.amountRepaid();
        var totalDefaulted = _loan3.principal.minus(totalRepaid);
        var totalDefaultedFromInvestor = totalDefaulted.times(investment.balance).div(_loan3.principal);
        totalValue = totalValue.plus(totalDefaultedFromInvestor);
      }
      return totalValue;
    }
  }, {
    key: 'getTotalInterestCollected',
    value: async function getTotalInterestCollected() {
      var investments = this.getInvestments();
      var totalInterest = new _bignumber2.default(0);
      for (var i = 0; i < investments.length; i++) {
        var investment = investments[i];
        var _loan4 = investment.loan;
        var interest = await _loan4.servicing.getInterestRepaidToDate(new Date());
        var interestToInvestor = interest.times(investment.balance).div(_loan4.principal);
        totalInterest = totalInterest.add(interestToInvestor);
      }
      return totalInterest;
    }
  }, {
    key: 'toJson',
    value: function toJson() {
      var raw = {
        investments: {},
        bids: {}
      };

      Object.keys(this.investments).forEach(function (uuid) {
        raw.investments[uuid] = this.investments[uuid].toJson();
      }.bind(this));

      Object.keys(this.bids).forEach(function (uuid) {
        raw.bids[uuid] = this.bids[uuid].toJson();
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
    key: 'stopWatchingEvents',
    value: async function stopWatchingEvents() {
      for (var uuid in this.investments) {
        var investment = this.investments[uuid];
        await investment.stopWatchingEvents();
      }

      for (var _uuid in this.bids) {
        var bid = this.bids[_uuid];
        await bid.stopWatchingEvents();
      }
    }
  }], [{
    key: 'load',
    value: async function load(dharma) {
      var raw = void 0;
      try {
        raw = await _fsExtra2.default.readJson(PORTFOLIO_STORE_FILE);
      } catch (err) {
        throw new Error('Portfolio store file does not exist.');
      }

      var investments = {};
      var bids = {};

      var loadInvestmentPromises = Object.keys(raw.investments).map(async function (uuid) {
        investments[uuid] = await _Investment2.default.fromJson(raw.investments[uuid], dharma);
      }.bind(this));
      var loadBidPromises = Object.keys(raw.bids).map(async function (uuid) {
        bids[uuid] = await Bid.fromJson(raw.bids[uuid], dharma);
      }.bind(this));

      var promises = [].concat(_toConsumableArray(loadInvestmentPromises), _toConsumableArray(loadBidPromises));

      await Promise.all(promises);

      return new Portfolio(dharma.web3, investments, bids);
    }
  }]);

  return Portfolio;
}();

module.exports = Portfolio;