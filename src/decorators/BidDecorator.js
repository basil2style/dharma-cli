'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bignumber = require('bignumber.js');

var _bignumber2 = _interopRequireDefault(_bignumber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var decimals = new _bignumber2.default(10 ** 18);

var BidDecorator = function () {
  function BidDecorator(bid) {
    _classCallCheck(this, BidDecorator);

    this.bid = bid;
  }

  _createClass(BidDecorator, [{
    key: 'amount',
    value: function amount() {
      var amountEther = this.bid.amount.div(decimals).toFixed(4);
      return '\u039E' + amountEther;
    }
  }, {
    key: 'minInterestRate',
    value: function minInterestRate() {
      var minInterestRateDecimal = this.bid.minInterestRate.div(decimals).times(100).toFixed(2);
      return '%' + minInterestRateDecimal.toString();
    }
  }]);

  return BidDecorator;
}();

module.exports = BidDecorator;