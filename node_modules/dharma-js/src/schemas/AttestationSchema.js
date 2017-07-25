'use strict';

var _Schema2 = require('./Schema.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AttestationSchema = function (_Schema) {
  _inherits(AttestationSchema, _Schema);

  function AttestationSchema(web3) {
    _classCallCheck(this, AttestationSchema);

    var schema = {
      uuid: new _Schema2.Bytes32Type(),
      borrower: new _Schema2.AddressType(web3),
      principal: new _Schema2.NumberType(),
      terms: new _Schema2.BytesType(),
      attestor: new _Schema2.AddressType(web3),
      attestorFee: new _Schema2.NumberType(),
      defaultRisk: new _Schema2.NumberType()
    };
    return _possibleConstructorReturn(this, (AttestationSchema.__proto__ || Object.getPrototypeOf(AttestationSchema)).call(this, 'Attestation', schema));
  }

  return AttestationSchema;
}(_Schema2.Schema);

module.exports = AttestationSchema;