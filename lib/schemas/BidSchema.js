import {Schema, NumberType, AddressType} from './Schema';

class BidSchema extends Schema {
  constructor(web3) {
    const schema = {
      bidder: new AddressType(web3),
      amount: new NumberType(),
      minInterestRate: new NumberType()
    }

    super('Bid', schema);
  }
}

module.exports = BidSchema;
