import BigNumber from 'bignumber.js';

const decimals = new BigNumber(10**18);

class SummaryDecorator {
  constructor(summary) {
    this.summary = summary;
  }

  principalCollected() {
    const principalCollected = this.summary.principalCollected
        .div(decimals).toFixed(4);
    return '\u039E' + principalCollected;
  }

  principalOutstanding() {
    const principalOutstanding = this.summary.principalOutstanding
        .div(decimals).toFixed(4);
    return '\u039E' + principalOutstanding;
  }


  interestCollected() {
    const interestCollected = this.summary.interestCollected
        .div(decimals).toFixed(4);
    return '\u039E' + interestCollected;
  }

  totalCash() {
    const totalCash = this.summary.totalCash
        .div(decimals).toFixed(4);
    return '\u039E' + totalCash;
  }

  cashDeposited() {
    const cashDeposited = this.summary.cashDeposited
        .div(decimals).toFixed(4);
    return '\u039E' + cashDeposited;
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
