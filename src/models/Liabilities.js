'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _Constants = require('../Constants');

var _Constants2 = _interopRequireDefault(_Constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LIABILITIES_STORE_FILE = _os2.default.homedir() + '/.dharma/liabilities.json';

var Liabilities = function () {
  function Liabilities() {
    var loans = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Liabilities);

    this.loans = loans;
  }

  _createClass(Liabilities, [{
    key: 'save',
    value: async function save() {
      var raw = this.toJson();
      await _fsExtra2.default.outputJson(LIABILITIES_STORE_FILE, raw);
    }
  }, {
    key: 'toJson',
    value: function toJson() {
      return Object.keys(this.loans);
    }
  }, {
    key: 'addLoan',
    value: function addLoan(loan) {
      this.loans[loan.uuid] = loan;
    }
  }], [{
    key: 'load',
    value: async function load(dharma) {
      var raw = void 0;
      try {
        raw = await _fsExtra2.default.readJson(LIABILITIES_STORE_FILE);
      } catch (err) {
        throw new Error('Liabilities store file does not exist.');
      }

      var loans = {};
      var promises = raw.map(function (uuid) {
        return new Promise(async function (resolve, reject) {
          try {
            var loan = await dharma.loans.get(uuid);
            if (loan.state === _Constants2.default.ACCEPTED_STATE) {
              loans[uuid] = loan;
            }
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      });

      await Promise.all(promises).catch(function (err) {
        throw err;
      });

      return new Liabilities(loans);
    }
  }]);

  return Liabilities;
}();

module.exports = Liabilities;