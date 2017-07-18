'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bignumber = require('bignumber.js');

var _bignumber2 = _interopRequireDefault(_bignumber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var decimals = new _bignumber2.default(10 ** 18);

var SummaryDecorator = function () {
  function SummaryDecorator(summary) {
    _classCallCheck(this, SummaryDecorator);

    this.summary = summary;
  }

  _createClass(SummaryDecorator, [{
    key: 'principalOutstanding',
    value: function principalOutstanding() {
      var principalOutstanding = this.summary.principalOutstanding.div(decimals).toFixed(4);
      return '\u039E' + principalOutstanding;
    }
  }, {
    key: 'interestEarned',
    value: function interestEarned() {
      var interestEarned = this.summary.interestEarned.div(decimals).toFixed(4);
      return '\u039E' + interestEarned;
    }
  }, {
    key: 'totalCash',
    value: function totalCash() {
      var totalCash = this.summary.totalCash.div(decimals).toFixed(4);
      return '\u039E' + totalCash;
    }
  }, {
    key: 'defaultedValue',
    value: function defaultedValue() {
      var defaultedValue = this.summary.defaultedValue.div(decimals).toFixed(4);
      return '-\u039E' + defaultedValue;
    }
  }, {
    key: 'totalValue',
    value: function totalValue() {
      var totalValue = this.summary.totalValue.div(decimals).toFixed(4);
      return '\u039E' + totalValue;
    }
  }]);

  return SummaryDecorator;
}();

module.exports = SummaryDecorator;