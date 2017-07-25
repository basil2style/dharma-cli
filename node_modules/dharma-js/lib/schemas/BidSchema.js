import {Schema, AddressType, NumberType} from './Schema.js';

class BidSchema extends Schema {
  constructor(web3, options={}) {
    const schema = {
      bidder: new AddressType(web3),
      amount: new NumberType()
    };
    super('Bid', schema, options);
  }
}

module.exports = BidSchema;
