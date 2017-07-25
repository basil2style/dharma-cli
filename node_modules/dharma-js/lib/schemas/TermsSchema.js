import {Schema, Bytes32Type, AddressType,
  NumberType, PeriodType, BooleanType} from './Schema.js';

class TermsSchema extends Schema {
  constructor(options={}) {
    const schema = {
      version: new NumberType(),
      periodType: new PeriodType(),
      periodLength: new NumberType(),
      termLength: new NumberType(),
      compounded: new BooleanType()
    };
    super('Terms', schema, options);
  }
}

module.exports = TermsSchema;
