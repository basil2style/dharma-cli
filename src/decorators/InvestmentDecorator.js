'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bignumber = require('bignumber.js');

var _bignumber2 = _interopRequireDefault(_bignumber);

var _LoanDecorator = require('./LoanDecorator');

var _LoanDecorator2 = _interopRequireDefault(_LoanDecorator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var decimals = new _bignumber2.default(10 ** 18);

var InvestmentDecorator = function () {
  function InvestmentDecorator(investment) {
    _classCallCheck(this, InvestmentDecorator);

    this.investment = investment;
    this.loanDecorator = new _LoanDecorator2.default(investment.loan);
  }

  _createClass(InvestmentDecorator, [{
    key: 'uuid',
    value: function uuid() {
      return this.loanDecorator.uuid();
    }
  }, {
    key: 'borrower',
    value: function borrower() {
      return this.loanDecorator.borrower();
    }
  }, {
    key: 'interestRate',
    value: function interestRate() {
      return this.loanDecorator.interestRate();
    }
  }, {
    key: 'principal',
    value: function principal() {
      return this.loanDecorator.principal();
    }
  }, {
    key: 'defaultRisk',
    value: function defaultRisk() {
      return this.loanDecorator.defaultRisk();
    }
  }, {
    key: 'amountRepaid',
    value: function amountRepaid() {
      var amountRepaidDecimal = this.investment.amountRepaid.div(decimals).toFixed(2);
      return '\u039E' + amountRepaidDecimal.toString();
    }
  }, {
    key: 'balance',
    value: function balance() {
      var balanceDecimal = this.investment.balance.div(decimals).toFixed(2);
      return balanceDecimal.toString();
    }
  }, {
    key: 'repaymentStatus',
    value: function repaymentStatus() {
      return this.investment.repaymentStatus;
    }
  }], [{
    key: 'individualRepayment',
    value: function individualRepayment(amount) {
      var individualRepaymentEther = amount.div(decimals).toFixed(2);
      return '\u039E' + individualRepaymentEther.toString();
    }
  }]);

  return InvestmentDecorator;
}();

module.exports = InvestmentDecorator;