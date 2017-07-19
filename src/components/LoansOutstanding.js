'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _blessed = require('blessed');

var _blessed2 = _interopRequireDefault(_blessed);

var _blessedContrib = require('blessed-contrib');

var _blessedContrib2 = _interopRequireDefault(_blessedContrib);

var _InvestmentDecorator = require('../decorators/InvestmentDecorator');

var _InvestmentDecorator2 = _interopRequireDefault(_InvestmentDecorator);

var _nodeEmoji = require('node-emoji');

var _nodeEmoji2 = _interopRequireDefault(_nodeEmoji);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var tableStyle = {
  top: 0,
  left: 0,
  label: 'Loans Outstanding',
  width: "70%",
  height: "60%",
  fg: 'white',
  selectedFg: 'white',
  selectedBg: '#007f00',
  border: {
    type: 'line',
    fg: 'cyan'
  },
  style: {
    bold: true,
    fg: 'green'
  },
  columnWidth: [14, 14, 10, 14, 10, 14, 14],
  columnSpacing: 6
};

var headers = ['UUID', 'PRINCIPAL', 'INTEREST', 'DEFAULT RISK', 'BALANCE', 'REPAY STATUS', 'AMT REPAID'];

var LoansOutstanding = function () {
  function LoansOutstanding(onLoanSelect) {
    _classCallCheck(this, LoansOutstanding);

    this.table = _blessedContrib2.default.table(tableStyle);
    this.onLoanSelect = onLoanSelect;
    this.investments = [];
    this.table.focus();
    this.selected = 0;

    this.selectDown = this.selectDown.bind(this);
    this.selectUp = this.selectUp.bind(this);
  }

  _createClass(LoansOutstanding, [{
    key: 'getNode',
    value: function getNode() {
      return this.table;
    }
  }, {
    key: 'selectDown',
    value: function selectDown() {
      if (this.selected == this.investments.length - 1) return;

      this.selected += 0.5;

      if (this.selected % 1 === 0) {
        this.onLoanSelect(this.selected);
      }
    }
  }, {
    key: 'selectUp',
    value: function selectUp() {
      if (this.selected == 0) return;

      this.selected -= 0.5;

      if (this.selected % 1 === 0) {
        this.onLoanSelect(this.selected);
      }
    }
  }, {
    key: 'render',
    value: function render(investments) {
      this.investments = investments;
      var investmentList = [];
      investments.forEach(function (investment) {
        var decorator = new _InvestmentDecorator2.default(investment);
        investmentList.push([decorator.uuid(), decorator.principal(), decorator.interestRate(), decorator.defaultRisk(), decorator.balance(), decorator.repaymentStatus(), decorator.amountRepaid()]);
      });

      this.table.setData({
        headers: headers,
        data: investmentList
      });
      this.table.rows.select(this.selected);
    }
  }]);

  return LoansOutstanding;
}();

module.exports = LoansOutstanding;