'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _blessed = require('blessed');

var _blessed2 = _interopRequireDefault(_blessed);

var _TermsDecorator = require('../decorators/TermsDecorator');

var _TermsDecorator2 = _interopRequireDefault(_TermsDecorator);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var listStyle = {
  left: '70%',
  width: '30%',
  height: '30%',
  label: 'Loan Terms',
  border: {
    type: 'line',
    fg: 'cyan'
  },
  style: {
    fg: '#007f00'
  },
  interactive: false
};

var Terms = function () {
  function Terms() {
    _classCallCheck(this, Terms);

    this.list = _blessed2.default.list(listStyle);
    this.currentIndex = -1;
  }

  _createClass(Terms, [{
    key: 'getNode',
    value: function getNode() {
      return this.list;
    }
  }, {
    key: 'render',
    value: function render(visibleTermsIndex, loans) {
      if (visibleTermsIndex == this.currentIndex || loans.length == 0) return;

      this.currentIndex = visibleTermsIndex;
      var terms = loans[visibleTermsIndex].terms;
      var decorator = new _TermsDecorator2.default(loans[visibleTermsIndex]);
      var termsList = ["Term: " + decorator.term(), "Term Start: " + decorator.startDate(), "Amortization: " + decorator.amortization(), "Compounded: No", "Repayment Grace Period: 2 weeks"];

      this.list.setItems(termsList);
    }
  }]);

  return Terms;
}();

module.exports = Terms;