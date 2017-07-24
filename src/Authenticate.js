'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _Errors = require('./Errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Authenticate = function () {
  function Authenticate() {
    _classCallCheck(this, Authenticate);

    this.storeFile = _os2.default.homedir() + '/.dharma/auth.json';
  }

  _createClass(Authenticate, [{
    key: 'getAuthToken',
    value: async function getAuthToken() {
      try {
        var auth = await _fsExtra2.default.readJson(this.storeFile);
        return auth.token;
      } catch (err) {
        throw new _Errors.AuthenticationError('Auth token file does not exist or is unreadable.');
      }
    }
  }, {
    key: 'setAuthToken',
    value: async function setAuthToken(token) {
      await _fsExtra2.default.outputJson(this.storeFile, { token: token });
    }
  }]);

  return Authenticate;
}();

module.exports = Authenticate;