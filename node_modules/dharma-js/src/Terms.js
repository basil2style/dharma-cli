'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Util = require('./Util.js');

var _Util2 = _interopRequireDefault(_Util);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Terms = function () {
  function Terms(web3, terms) {
    var _this = this;

    _classCallCheck(this, Terms);

    this.web3 = web3;
    this.terms = terms;

    var _loop = function _loop(term) {
      _this[term] = function () {
        return _this.terms[term];
      };
    };

    for (var term in terms) {
      _loop(term);
    }
  }

  _createClass(Terms, [{
    key: 'equals',
    value: function equals(termsObj) {
      return _lodash2.default.isEqual(termsObj.terms, this.terms);
    }
  }, {
    key: 'toByteString',
    value: function toByteString() {
      var version = _Util2.default.stripZeroEx(this.web3.toHex(this.terms.version));
      var periodType = _Util2.default.stripZeroEx(this.web3.toHex(this.getPeriodTypeValue()));
      var periodLength = _Util2.default.stripZeroEx(this.web3.toHex(this.terms.periodLength));
      var termLength = _Util2.default.stripZeroEx(this.web3.toHex(this.terms.termLength));
      var compounded = _Util2.default.stripZeroEx(this.web3.toHex(this.terms.compounded));

      version = this.web3.padLeft(version, 2); // uint8
      periodType = this.web3.padLeft(periodType, 2); // uint8
      periodLength = this.web3.padLeft(periodLength, 64); // uint256
      termLength = this.web3.padLeft(termLength, 64); // uint256
      compounded = this.web3.padLeft(compounded, 2); // bool

      return '0x' + version + periodType + periodLength + termLength + compounded;
    }
  }, {
    key: 'toJson',
    value: function toJson() {
      return this.terms;
    }
  }, {
    key: 'getPeriodTypeValue',
    value: function getPeriodTypeValue() {
      var periodTypes = {
        "daily": 0,
        "weekly": 1,
        "monthly": 2,
        "yearly": 3,
        "fixed": 4
      };

      return periodTypes[this.terms.periodType];
    }
  }], [{
    key: 'byteStringToJson',
    value: function byteStringToJson(web3, byteString) {
      var data = _Util2.default.stripZeroEx(byteString);

      var terms = {
        version: web3.toDecimal(data.slice(0, 2)),
        periodType: Terms.valueToPeriodType(web3.toDecimal(data.slice(2, 4))),
        periodLength: web3.toDecimal(data.slice(4, 68)),
        termLength: web3.toDecimal(data.slice(68, 132)),
        compounded: web3.toDecimal(data.slice(132, 134)) == 1
      };

      return terms;
    }
  }, {
    key: 'valueToPeriodType',
    value: function valueToPeriodType(value) {
      var periodTypes = ['daily', 'weekly', 'monthly', 'yearly', 'fixed'];
      return periodTypes[value];
    }
  }]);

  return Terms;
}();

module.exports = Terms;