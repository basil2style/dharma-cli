import BigNumber from 'bignumber.js';

class Type {
  constructor(options={}) {
    this.options = options;
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

module.exports = {Schema, AddressType, NumberType};
