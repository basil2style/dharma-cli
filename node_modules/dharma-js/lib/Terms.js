import Util from './Util.js';
import _ from 'lodash';

class Terms {
  constructor(web3, terms) {
    this.web3 = web3;
    this.terms = terms;

    for (let term in terms) {
      this[term] = () => { return this.terms[term] };
    }
  }

  equals(termsObj) {
    return _.isEqual(termsObj.terms, this.terms);
  }

  toByteString() {
    let version = Util.stripZeroEx(this.web3.toHex(this.terms.version));
    let periodType = Util.stripZeroEx(this.web3.toHex(this.getPeriodTypeValue()))
    let periodLength = Util.stripZeroEx(this.web3.toHex(this.terms.periodLength))
    let termLength = Util.stripZeroEx(this.web3.toHex(this.terms.termLength))
    let compounded = Util.stripZeroEx(this.web3.toHex(this.terms.compounded))

    version = this.web3.padLeft(version, 2) // uint8
    periodType = this.web3.padLeft(periodType, 2) // uint8
    periodLength = this.web3.padLeft(periodLength, 64) // uint256
    termLength = this.web3.padLeft(termLength, 64) // uint256
    compounded = this.web3.padLeft(compounded, 2) // bool

    return '0x' + version + periodType + periodLength + termLength + compounded;
  }

  toJson() {
    return this.terms;
  }

  static byteStringToJson(web3, byteString) {
    let data = Util.stripZeroEx(byteString);

    let terms = {
      version: web3.toDecimal(data.slice(0,2)),
      periodType: Terms.valueToPeriodType(web3.toDecimal(data.slice(2,4))),
      periodLength: web3.toDecimal(data.slice(4,68)),
      termLength: web3.toDecimal(data.slice(68, 132)),
      compounded: (web3.toDecimal(data.slice(132, 134)) == 1)
    }

    return terms;
  }

  getPeriodTypeValue() {
    let periodTypes = {
      "daily": 0,
      "weekly": 1,
      "monthly": 2,
      "yearly": 3,
      "fixed": 4
    }

    return periodTypes[this.terms.periodType];
  }

  static valueToPeriodType(value) {
    let periodTypes = ['daily', 'weekly', 'monthly', 'yearly', 'fixed'];
    return periodTypes[value];
  }
}

module.exports = Terms;
