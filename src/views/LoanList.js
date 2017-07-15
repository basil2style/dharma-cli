"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LoanList = function (_Component) {
  _inherits(LoanList, _Component);

  function LoanList() {
    _classCallCheck(this, LoanList);

    return _possibleConstructorReturn(this, (LoanList.__proto__ || Object.getPrototypeOf(LoanList)).apply(this, arguments));
  }

  _createClass(LoanList, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.refs.list.setLabel("Loans Outstanding");
    }
  }, {
    key: "render",
    value: function render() {
      var data = this.props.loans;

      return _react2.default.createElement("listtable", {
        ref: "list",
        top: "0",
        left: "0",
        width: "60%",
        height: "60%",
        data: data,
        border: { type: 'line' },
        noCellBorders: "true",
        style: { border: { fg: 'cyan' } } });
    }
  }]);

  return LoanList;
}(_react.Component);

module.exports = LoanList;