import {Schema, Bytes32Type, BytesType, AddressType, NumberType} from './Schema.js';

class AttestationSchema extends Schema {
  constructor(web3) {
    const schema = {
      uuid: new Bytes32Type(),
      borrower: new AddressType(web3),
      principal: new NumberType(),
      terms: new BytesType(),
      attestor: new AddressType(web3),
      attestorFee: new NumberType(),
      defaultRisk: new NumberType(),
    }
    super('Attestation', schema);
  }
}

module.exports = AttestationSchema;
