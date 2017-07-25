import {Schema, Bytes32Type, AddressType,
  NumberType, PeriodType} from './Schema.js';
import TermsSchema from './TermsSchema.js';
import SignatureSchema from './SignatureSchema.js';

class LoanSchema extends Schema {
  constructor(web3) {
    const schema = {
      uuid: new Bytes32Type(),
      borrower: new AddressType(web3),
      principal: new NumberType(),
      terms: new TermsSchema(),
      attestor: new AddressType(web3),
      attestorFee: new NumberType(),
      defaultRisk: new NumberType(),
      signature: new SignatureSchema({ optional: true }),
      auctionPeriodLength: new NumberType(),
      reviewPeriodLength: new NumberType(),
      auctionPeriodEndBock: new NumberType({ optional: true }),
      reviewPeriodEndBlock: new NumberType({ optional: true })
    };
    super('Loan', schema);
  }
}

module.exports = LoanSchema;
