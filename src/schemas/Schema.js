'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bignumber = require('bignumber.js');

var _bignumber2 = _interopRequireDefault(_bignumber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Type = function Type() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  _classCallCheck(this, Type);

  this.options = options;
};

var NumberType = function (_Type) {
  _inherits(NumberType, _Type);

  function NumberType() {
    _classCallCheck(this, NumberType);

    return _possibleConstructorReturn(this, (NumberType.__proto__ || Object.getPrototypeOf(NumberType)).apply(this, arguments));
  }

  _createClass(NumberType, [{
    key: 'validate',
    value: function validate(term) {
      try {
        var bigNumber = new _bignumber2.default(term);
      } catch (err) {
        throw new Error(term + ' is not a valid number: ' + err);
      }
    }
  }]);

  return NumberType;
}(Type);

var AddressType = function (_Type2) {
  _inherits(AddressType, _Type2);

  function AddressType(web3, options) {
    _classCallCheck(this, AddressType);

    var _this2 = _possibleConstructorReturn(this, (AddressType.__proto__ || Object.getPrototypeOf(AddressType)).call(this, options));

    _this2.web3 = web3;
    return _this2;
  }

  _createClass(AddressType, [{
    key: 'validate',
    value: function validate(term) {
      if (!this.web3.isAddress(term)) throw new Error('Address format is invalid');
    }
  }]);

  return AddressType;
}(Type);

var Schema = function () {
  function Schema(name, schema) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, Schema);

    this.name = name;
    this.schema = schema;
    this.options = options;
  }

  _createClass(Schema, [{
    key: 'validate',
    value: function validate(terms) {
      for (var key in this.schema) {
        if (!(key in terms)) {
          if (!this.schema[key].options.optional) {
            throw 'Required term ' + key + ' is missing.';
          }
        } else {
          this.schema[key].validate(terms[key]);
        }
      }
    }
  }]);

  return Schema;
}();

module.exports = { Schema: Schema, AddressType: AddressType, NumberType: NumberType };