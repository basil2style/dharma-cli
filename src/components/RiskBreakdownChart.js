'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _blessedContrib = require('blessed-contrib');

var _blessedContrib2 = _interopRequireDefault(_blessedContrib);

var _bignumber = require('bignumber.js');

var _bignumber2 = _interopRequireDefault(_bignumber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var barStyle = {
  top: '60%',
  left: '30%',
  width: '40%',
  height: '40%',
  label: 'Default Risk Breakdown (\u039E)',
  border: {
    type: 'line',
    fg: 'cyan'
  },
  barFgColor: 'white',
  barBgColor: 'green',
  barWidth: 8,
  barSpacing: 15,
  xOffset: 0,
  maxHeight: 9
};

var RiskBreakdownChart = function () {
  function RiskBreakdownChart() {
    _classCallCheck(this, RiskBreakdownChart);

    this.barChart = _blessedContrib2.default.bar(barStyle);
  }

  _createClass(RiskBreakdownChart, [{
    key: 'getNode',
    value: function getNode() {
      return this.barChart;
    }
  }, {
    key: 'render',
    value: function render(investments) {
      var riskTranches = ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'];
      var riskProfile = [];

      var _loop = function _loop(i) {
        var valueInvested = new _bignumber2.default(0);
        var decimals = new _bignumber2.default(10 ** 18);
        var trancheWidth = new _bignumber2.default(0.2);
        var defaultRiskMin = trancheWidth.times(i).plus(0.01).times(decimals);
        var defaultRiskMax = trancheWidth.times(i + 1).times(decimals);

        investments.forEach(function (investment) {
          var loan = investment.loan;
          var balance = new _bignumber2.default(investment.balance);
          if (loan.defaultRisk.gte(defaultRiskMin) && loan.defaultRisk.lte(defaultRiskMax)) {
            valueInvested = valueInvested.plus(balance.div(decimals));
          }
        });

        riskProfile.push(valueInvested);
      };

      for (var i = 0; i < 5; i++) {
        _loop(i);
      }

      this.barChart.maxHeight = Math.max(riskProfile);

      this.barChart.setData({
        titles: riskTranches,
        data: riskProfile
      });
    }
  }]);

  return RiskBreakdownChart;
}();

module.exports = RiskBreakdownChart;