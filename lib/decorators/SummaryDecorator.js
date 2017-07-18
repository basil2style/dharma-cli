import BigNumber from 'bignumber.js';

const decimals = new BigNumber(10**18);

class SummaryDecorator {
  constructor(summary) {
    this.summary = summary;
  }

  principalOutstanding() {
    const principalOutstanding = this.summary.principalOutstanding
        .div(decimals).toFixed(4);
    return '\u039E' + principalOutstanding;
  }

  interestEarned() {
    const interestEarned = this.summary.interestEarned
        .div(decimals).toFixed(4);
    return '\u039E' + interestEarned;
  }

  totalCash() {
    const totalCash = this.summary.totalCash
        .div(decimals).toFixed(4);
    return '\u039E' + totalCash;
  }

  defaultedValue() {
    const defaultedValue = this.summary.defaultedValue
        .div(decimals).toFixed(4);
    return '-\u039E' + defaultedValue;
  }

  totalValue() {
    const totalValue = this.summary.totalValue
        .div(decimals).toFixed(4);
    return '\u039E' + totalValue;
  }
}

module.exports = SummaryDecorator;
