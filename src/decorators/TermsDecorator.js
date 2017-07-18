'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TermsDecorator = function () {
  function TermsDecorator(loan) {
    _classCallCheck(this, TermsDecorator);

    this.loan = loan;
  }

  _createClass(TermsDecorator, [{
    key: 'term',
    value: function term() {
      var termLength = this.loan.terms.termLength;
      var periodLength = this.loan.terms.periodLength;
      var periodType = this.loan.terms.periodType;
      var numUnits = termLength * periodLength;

      var termString = numUnits.toString() + ' ' + this._timeUnit(periodType);
      if (numUnits > 1) {
        termString += 's';
      }

      return termString;
    }
  }, {
    key: 'amortization',
    value: function amortization() {
      var periodLength = this.loan.terms.periodLength;
      var periodType = this.loan.terms.periodType;

      var amortizationString = 'Repayments due every ';
      if (periodLength > 1) {
        amortizationString += periodLength + this._timeUnit(periodType) + 's';
      } else {
        amortizationString += this._timeUnit(periodType);
      }

      return amortizationString;
    }
  }, {
    key: 'startDate',
    value: function startDate() {
      var termBeginTimestamp = this.loan.termBeginTimestamp.times(1000);
      var termBeginDate = new Date(termBeginTimestamp.toNumber());
      return termBeginDate.toString();
    }
  }, {
    key: '_timeUnit',
    value: function _timeUnit(periodType) {
      switch (periodType) {
        case 'daily':
          return 'day';
          break;
        case 'weekly':
          return 'week';
          break;
        case 'monthly':
          return 'month';
          break;
        case 'yearly':
          return 'year';
          break;
      }
    }
  }]);

  return TermsDecorator;
}();

module.exports = TermsDecorator;