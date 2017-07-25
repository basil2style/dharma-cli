'use strict';

var _Schema2 = require('./Schema.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BidSchema = function (_Schema) {
  _inherits(BidSchema, _Schema);

  function BidSchema(web3) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, BidSchema);

    var schema = {
      bidder: new _Schema2.AddressType(web3),
      amount: new _Schema2.NumberType()
    };
    return _possibleConstructorReturn(this, (BidSchema.__proto__ || Object.getPrototypeOf(BidSchema)).call(this, 'Bid', schema, options));
  }

  return BidSchema;
}(_Schema2.Schema);

module.exports = BidSchema;