'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _blessed = require('blessed');

var _blessed2 = _interopRequireDefault(_blessed);

var _blessedContrib = require('blessed-contrib');

var _blessedContrib2 = _interopRequireDefault(_blessedContrib);

var _LoanDecorator = require('../decorators/LoanDecorator');

var _LoanDecorator2 = _interopRequireDefault(_LoanDecorator);

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
  interactive: true,
  border: {
    type: 'line',
    fg: 'cyan'
  },
  style: {
    bold: true,
    fg: 'green'
  },
  keys: true,
  columnWidth: [14, 14, 10, 10, 14, 12, 12],
  columnSpacing: 6
};

var headers = ['UUID', 'BORROWER', 'PRINCIPAL', 'INTEREST', 'ATTESTOR', 'ATTESTOR FEE', 'DEFAULT RISK'];

var LoansOutstanding = function () {
  function LoansOutstanding(onLoanSelect) {
    _classCallCheck(this, LoansOutstanding);

    this.table = _blessedContrib2.default.table(tableStyle);
    this.onLoanSelect = onLoanSelect;
    this.table.rows.on('select item', function (item, index) {
      this.onLoanSelect(index);
    }.bind(this));
    this.loans = [];
  }

  _createClass(LoansOutstanding, [{
    key: 'getNode',
    value: function getNode() {
      return this.table;
    }
  }, {
    key: 'render',
    value: function render(investments) {
      var loans = investments.map(function (investment) {
        return investment.loan;
      });

      if (_lodash2.default.isEqual(this.loans, loans)) return;

      this.loans = loans;
      var loanList = [];
      loans.forEach(function (loan) {
        var decorator = new _LoanDecorator2.default(loan);
        loanList.push([decorator.uuid(), decorator.borrower(), decorator.principal(), decorator.interestRate(), decorator.attestor(), decorator.attestorFee(), decorator.defaultRisk()]);
      });

      this.table.focus();
      this.table.setData({
        headers: headers,
        data: loanList
      });
    }
  }]);

  return LoansOutstanding;
}();

module.exports = LoansOutstanding;