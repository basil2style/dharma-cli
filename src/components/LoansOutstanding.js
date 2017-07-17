'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _blessed = require('blessed');

var _blessed2 = _interopRequireDefault(_blessed);

var _LoanDecorator = require('../decorators/LoanDecorator');

var _LoanDecorator2 = _interopRequireDefault(_LoanDecorator);

var _nodeEmoji = require('node-emoji');

var _nodeEmoji2 = _interopRequireDefault(_nodeEmoji);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var containerStyle = {
  top: 0,
  left: 0,
  label: 'Loans Outstanding',
  width: "60%",
  height: "60%",
  border: {
    type: 'line'
  },
  style: {
    border: {
      fg: 'cyan'
    }
  }
};

var boxStyle = {
  width: '95%',
  height: '95%',
  top: 'center',
  left: 'center'
};

var listStyle = {
  top: 0,
  left: 0,
  width: '5%',
  height: '100%',
  align: 'center',
  keys: true
};

var listTableStyle = {
  top: 0,
  left: '5%',
  width: '95%',
  height: '100%',
  align: 'center',
  style: {
    header: {
      bg: 'cyan'
    }
  },
  noCellBorders: true
};

var headers = ['UUID', 'BORROWER', 'PRINCIPAL', 'INTEREST', 'ATTESTOR', 'ATTESTOR FEE', 'DEFAULT RISK'];

var LoansOutstanding = function () {
  function LoansOutstanding() {
    _classCallCheck(this, LoansOutstanding);

    this.container = _blessed2.default.box(containerStyle);
    this.box = _blessed2.default.box(boxStyle);
    this.listTable = _blessed2.default.listtable(listTableStyle);
    this.listTable.setData([headers]);
    this.list = _blessed2.default.list(listStyle);
    this.selected = 1;

    this.box.append(this.list);
    this.box.append(this.listTable);

    this.container.append(this.box);
  }

  _createClass(LoansOutstanding, [{
    key: 'getNode',
    value: function getNode() {
      return this.container;
    }
  }, {
    key: 'render',
    value: function render(loans) {
      var loanList = [headers];
      loans.forEach(function (loan) {
        var decorator = new _LoanDecorator2.default(loan);
        loanList.push([decorator.uuid(), decorator.borrower(), decorator.principal(), decorator.interestRate(), decorator.attestor(), decorator.attestorFee(), decorator.defaultRisk()]);
      });
      var stubList = Array(loanList.length).fill("");
      stubList[this.selected] = _nodeEmoji2.default.get('coffee');

      this.listTable.setData(loanList);
      this.list.setItems(stubList);
      this.list.select(this.selected);
      this.list.on('select item', function (item, index) {
        this.selected = index;
        this.list.setItem(_nodeEmoji2.default.get('coffee'), "");
        this.list.setItem(index, _nodeEmoji2.default.get('coffee'));
      }.bind(this));
      this.list.focus();
    }
  }]);

  return LoansOutstanding;
}();

module.exports = LoansOutstanding;