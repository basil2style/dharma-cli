'use strict';

var _Schema2 = require('./Schema.js');

var _TermsSchema = require('./TermsSchema.js');

var _TermsSchema2 = _interopRequireDefault(_TermsSchema);

var _SignatureSchema = require('./SignatureSchema.js');

var _SignatureSchema2 = _interopRequireDefault(_SignatureSchema);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LoanSchema = function (_Schema) {
  _inherits(LoanSchema, _Schema);

  function LoanSchema(web3) {
    _classCallCheck(this, LoanSchema);

    var schema = {
      uuid: new _Schema2.Bytes32Type(),
      borrower: new _Schema2.AddressType(web3),
      principal: new _Schema2.NumberType(),
      terms: new _TermsSchema2.default(),
      attestor: new _Schema2.AddressType(web3),
      attestorFee: new _Schema2.NumberType(),
      defaultRisk: new _Schema2.NumberType(),
      signature: new _SignatureSchema2.default({ optional: true }),
      auctionPeriodLength: new _Schema2.NumberType(),
      reviewPeriodLength: new _Schema2.NumberType(),
      auctionPeriodEndBock: new _Schema2.NumberType({ optional: true }),
      reviewPeriodEndBlock: new _Schema2.NumberType({ optional: true })
    };
    return _possibleConstructorReturn(this, (LoanSchema.__proto__ || Object.getPrototypeOf(LoanSchema)).call(this, 'Loan', schema));
  }

  return LoanSchema;
}(_Schema2.Schema);

module.exports = LoanSchema;