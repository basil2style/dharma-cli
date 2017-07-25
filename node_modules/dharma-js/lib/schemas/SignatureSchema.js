import {Schema, Bytes32Type, Bytes1Type, AddressType,
  NumberType, PeriodType, BooleanType} from './Schema.js';

class SignatureSchema extends Schema {
  constructor(options={}) {
    const schema = {
      r: new Bytes32Type(),
      s: new Bytes32Type(),
      v: new Bytes1Type()
    };
    super('Signature', schema, options);
  }
}

module.exports = SignatureSchema;
