'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _blessed = require('blessed');

var _blessed2 = _interopRequireDefault(_blessed);

var _SummaryDecorator = require('../decorators/SummaryDecorator');

var _SummaryDecorator2 = _interopRequireDefault(_SummaryDecorator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var containerStyle = {
  top: '30%',
  left: '70%',
  width: '30%',
  height: '30%',
  label: 'Portfolio Summary',
  border: {
    type: 'line',
    fg: 'cyan'
  }
};

var cashListLabelStyle = {
  left: '5%',
  top: '10%',
  width: '50%',
  align: 'left',
  items: ['Principal Collected:', 'Interest Collected:', 'Cash Deposited:']
};

var cashListValueStyle = {
  left: '45%',
  top: '10%',
  width: '50%',
  align: 'right',
  style: {
    fg: 'green'
  },
  interactive: false
};

var cashFlowsListLabelStyle = {
  left: '5%',
  top: '45%',
  width: '50%',
  align: 'left',
  items: ['Total Cash:', 'Principal Outstanding:', 'Defaulted Value:']
};

var cashFlowsListValueStyle = {
  left: '45%',
  top: '45%',
  width: '50%',
  align: 'right',
  style: {
    fg: 'green'
  },
  interactive: false
};

var firstDividerStyle = {
  width: '90%',
  top: '35%',
  left: 'center',
  style: {
    fg: 'cyan'
  },
  orientation: 'horizontal'
};

var secondDividerStyle = {
  width: '90%',
  top: '65%',
  left: 'center',
  style: {
    fg: 'cyan'
  },
  orientation: 'horizontal'
};

var totalLabelStyle = {
  top: '75%',
  left: '5%',
  content: 'Total Value:'
};

var totalValueStyle = {
  top: '75%',
  left: '45%',
  width: '50%',
  align: 'right',
  interactive: false,
  style: {
    fg: 'green'
  }
};

var PortfolioSummary = function () {
  function PortfolioSummary() {
    _classCallCheck(this, PortfolioSummary);

    this.container = _blessed2.default.box(containerStyle);
    this.cashListLabels = _blessed2.default.list(cashListLabelStyle);
    this.cashListValues = _blessed2.default.list(cashListValueStyle);
    this.cashFlowsListLabels = _blessed2.default.list(cashFlowsListLabelStyle);
    this.cashFlowsListValues = _blessed2.default.list(cashFlowsListValueStyle);
    this.totalLabel = _blessed2.default.text(totalLabelStyle);
    this.totalValueText = _blessed2.default.list(totalValueStyle);

    this.firstDivider = _blessed2.default.line(firstDividerStyle);
    this.secondDivider = _blessed2.default.line(secondDividerStyle);

    this.container.append(this.cashListLabels);
    this.container.append(this.cashListValues);
    this.container.append(this.cashFlowsListLabels);
    this.container.append(this.cashFlowsListValues);

    this.container.append(this.firstDivider);
    this.container.append(this.secondDivider);

    this.container.append(this.totalLabel);
    this.container.append(this.totalValueText);
  }

  _createClass(PortfolioSummary, [{
    key: 'getNode',
    value: function getNode() {
      return this.container;
    }
  }, {
    key: 'render',
    value: function render(summary) {
      if (summary.length == 0) return;

      var decorator = new _SummaryDecorator2.default(summary);

      this.cashListValues.setItems([decorator.principalCollected(), decorator.interestCollected(), decorator.cashDeposited()]);

      this.cashFlowsListValues.setItems([decorator.totalCash(), decorator.principalOutstanding(), decorator.defaultedValue()]);

      this.totalValueText.setItems([decorator.totalValue()]);
    }
  }]);

  return PortfolioSummary;
}();

module.exports = PortfolioSummary;