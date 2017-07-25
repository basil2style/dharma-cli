import BigNumber from 'bignumber.js';

class Type {
  constructor(options={}) {
    this.options = options;
  }
}

class AddressType extends Type {
  constructor(web3, options) {
    super(options)
    this.web3 = web3;
  }

  validate(term) {
    if (!this.web3.isAddress(term))
      throw new Error('Address format is invalid');
  }
}

class Bytes32Type extends Type {
  validate(term) {
    if (!/0x[0-9A-Fa-f]{64}/g.test(term))
      throw new Error(term + ' is not a valid Bytes32Type');
  }
}

class Bytes1Type extends Type {
  validate(term) {
    if (!/0x[0-9A-Fa-f]{2}/g.test(term))
      throw new Error(term + ' is not a valid Bytes1Type');
  }
}

class BytesType extends Type {
  validate(term) {
    if (!/0x[0-9A-Fa-f]+/g.test(term))
      throw new Error(term + ' is not a valid BytesType');
  }
}

class NumberType extends Type {
  validate(term) {
    try {
      const bigNumber = new BigNumber(term);
    } catch (err) {
      throw new Error(term + ' is not a valid number: ' + err);
    }
  }
}

class BooleanType extends Type {
  validate(term) {
    if (typeof term !== 'boolean')
      throw new Error(term + ' is not a valid boolean');
  }
}

class PeriodType extends Type {
  validate(term) {
    if (!(term === 'daily' ||
        term === 'weekly' ||
        term === 'monthly' ||
        term === 'yearly' ||
        term === 'fixed'))
      throw new Error('Invalid period type');
  }
}

class Schema {
  constructor(name, schema, options={}) {
    this.name = name
    this.schema = schema;
    this.options = options;
  }

  validate(terms) {
    for (let key in this.schema) {
      if (!(key in terms)) {
        if (!this.schema[key].options.optional) {
          throw 'Required term ' + key + ' is missing.';
        }
      } else {
        this.schema[key].validate(terms[key])
      }
    }
  }
}

module.exports = {Schema, BooleanType, BytesType, Bytes32Type, Bytes1Type,
  AddressType, NumberType, PeriodType};
