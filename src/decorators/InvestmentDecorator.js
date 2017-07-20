"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bignumber = require("bignumber.js");

var _bignumber2 = _interopRequireDefault(_bignumber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var decimals = new _bignumber2.default(10 ** 18);

var InvestmentDecorator = function () {
  function InvestmentDecorator(investment) {
    _classCallCheck(this, InvestmentDecorator);

    this.investment = investment;
  }

  _createClass(InvestmentDecorator, [{
    key: "uuid",
    value: function uuid() {
      return this.investment.loan.uuid.slice(0, 10) + "...";
    }
  }, {
    key: "borrower",
    value: function borrower() {
      return this.investment.loan.borrower.slice(0, 10) + "...";
    }
  }, {
    key: "interestRate",
    value: function interestRate() {
      var interestRateDecimal = this.investment.loan.interestRate.div(decimals).times(100).toFixed(2);
      return '%' + interestRateDecimal.toString();
    }
  }, {
    key: "principal",
    value: function principal() {
      var principalDecimal = this.investment.loan.principal.div(decimals).toFixed(2);
      return "\u039E" + principalDecimal.toString();
    }
  }, {
    key: "defaultRisk",
    value: function defaultRisk() {
      var defaultRiskDecimal = this.investment.loan.defaultRisk.div(decimals).times(100).toFixed(2);
      return '%' + defaultRiskDecimal.toString();
    }
  }, {
    key: "amountRepaid",
    value: function amountRepaid() {
      var amountRepaidDecimal = this.investment.amountRepaid.div(decimals).toFixed(2);
      return "\u039E" + amountRepaidDecimal.toString();
    }
  }, {
    key: "balance",
    value: function balance() {
      var balanceDecimal = this.investment.balance.div(decimals).toFixed(2);
      return balanceDecimal.toString();
    }
  }, {
    key: "repaymentStatus",
    value: function repaymentStatus() {
      return this.investment.repaymentStatus;
    }
  }], [{
    key: "individualRepayment",
    value: function individualRepayment(amount) {
      var individualRepaymentEther = amount.div(decimals).toFixed(2);
      return "\u039E" + individualRepaymentEther.toString();
    }
  }]);

  return InvestmentDecorator;
}();

module.exports = InvestmentDecorator;