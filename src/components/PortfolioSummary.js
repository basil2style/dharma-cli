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

var labelListStyle = {
  left: '5%',
  top: '10%',
  width: '50%',
  align: 'left',
  items: ['Principal Outstanding:', "", 'Interest Earned:', "", 'Total Cash:', "", 'Defaulted Loans:', ""]
};

var valueListStyle = {
  left: '45%',
  top: '10%',
  width: '50%',
  align: 'right',
  style: {
    fg: 'green'
  },
  interactive: false
};

var dividerStyle = {
  width: '90%',
  top: '70%',
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
    this.labelList = _blessed2.default.list(labelListStyle);
    this.valueList = _blessed2.default.list(valueListStyle);
    this.divider = _blessed2.default.line(dividerStyle);
    this.totalLabel = _blessed2.default.text(totalLabelStyle);
    this.totalValueText = _blessed2.default.list(totalValueStyle);

    this.container.append(this.labelList);
    this.container.append(this.valueList);
    this.container.append(this.divider);
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
      var toBeRendered = [decorator.principalOutstanding(), "", decorator.interestEarned(), "", decorator.totalCash(), "", decorator.defaultedValue(), ""];

      this.valueList.setItems(toBeRendered);

      this.totalValueText.setItems([decorator.totalValue()]);
    }
  }]);

  return PortfolioSummary;
}();

module.exports = PortfolioSummary;