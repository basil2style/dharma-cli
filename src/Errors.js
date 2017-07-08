"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AuthenticationError = function (_Error) {
  _inherits(AuthenticationError, _Error);

  function AuthenticationError(message) {
    _classCallCheck(this, AuthenticationError);

    var _this = _possibleConstructorReturn(this, (AuthenticationError.__proto__ || Object.getPrototypeOf(AuthenticationError)).call(this, message));

    _this.type = "AuthenticationError";
    return _this;
  }

  return AuthenticationError;
}(Error);

var RejectionError = function (_Error2) {
  _inherits(RejectionError, _Error2);

  function RejectionError(message) {
    _classCallCheck(this, RejectionError);

    var _this2 = _possibleConstructorReturn(this, (RejectionError.__proto__ || Object.getPrototypeOf(RejectionError)).call(this, message));

    _this2.type = "RejectionError";
    return _this2;
  }

  return RejectionError;
}(Error);

module.exports = { AuthenticationError: AuthenticationError, RejectionError: RejectionError };