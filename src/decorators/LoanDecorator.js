"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bignumber = require("bignumber.js");

var _bignumber2 = _interopRequireDefault(_bignumber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var decimals = new _bignumber2.default(10 ** 18);

var LoanDecorator = function () {
  function LoanDecorator(loan) {
    _classCallCheck(this, LoanDecorator);

    this.loan = loan;
  }

  _createClass(LoanDecorator, [{
    key: "uuid",
    value: function uuid() {
      return this.loan.uuid.slice(0, 10) + "...";
    }
  }, {
    key: "borrower",
    value: function borrower() {
      return this.loan.borrower.slice(0, 10) + "...";
    }
  }, {
    key: "attestor",
    value: function attestor() {
      return this.loan.attestor.slice(0, 10) + "...";
    }
  }, {
    key: "interestRate",
    value: function interestRate() {
      var interestRateDecimal = this.loan.interestRate.div(decimals).times(100).toFixed(2);
      return '%' + interestRateDecimal.toString();
    }
  }, {
    key: "principal",
    value: function principal() {
      var principalDecimal = this.loan.principal.div(decimals).toFixed(2);
      return principalDecimal.toString();
    }
  }, {
    key: "attestorFee",
    value: function attestorFee() {
      var attestorFeeDecimal = this.loan.attestorFee.div(decimals).toFixed(2);
      return attestorFeeDecimal.toString();
    }
  }, {
    key: "defaultRisk",
    value: function defaultRisk() {
      var defaultRiskDecimal = this.loan.defaultRisk.div(decimals).times(100).toFixed(2);
      return '%' + defaultRiskDecimal.toString();
    }
  }]);

  return LoanDecorator;
}();

module.exports = LoanDecorator;