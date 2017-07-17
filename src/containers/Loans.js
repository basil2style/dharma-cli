'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _LoanList = require('../components/LoanList');

var _LoanList2 = _interopRequireDefault(_LoanList);

var _reactRedux = require('react-redux');

var _LoanDecorator = require('../decorators/LoanDecorator');

var _LoanDecorator2 = _interopRequireDefault(_LoanDecorator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function loansOutstanding(loans) {
  var loanList = [];
  loans.forEach(function (loan) {
    var decorator = new _LoanDecorator2.default(loan);
    loanList.push([decorator.uuid(), decorator.borrower(), decorator.principal(), decorator.interestRate(), decorator.attestor(), decorator.attestorFee(), decorator.defaultRisk()]);
  });

  return loanList;
}

var mapStateToProps = function mapStateToProps(state) {
  return {
    loans: loansOutstanding(state.loans)
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
  return {};
};

var Loans = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(_LoanList2.default);

exports.default = Loans;