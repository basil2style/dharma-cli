'use strict';

var _Schema2 = require('./Schema.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SignatureSchema = function (_Schema) {
  _inherits(SignatureSchema, _Schema);

  function SignatureSchema() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, SignatureSchema);

    var schema = {
      r: new _Schema2.Bytes32Type(),
      s: new _Schema2.Bytes32Type(),
      v: new _Schema2.Bytes1Type()
    };
    return _possibleConstructorReturn(this, (SignatureSchema.__proto__ || Object.getPrototypeOf(SignatureSchema)).call(this, 'Signature', schema, options));
  }

  return SignatureSchema;
}(_Schema2.Schema);

module.exports = SignatureSchema;