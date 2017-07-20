import BigNumber from 'bignumber.js';

const decimals = new BigNumber(10**18);

class BidDecorator {
  constructor(bid) {
    this.bid = bid;
  }

  amount() {
    const amountEther = this.bid.amount
        .div(decimals).toFixed(4);
    return '\u039E' + amountEther;
  }

  minInterestRate() {
    const minInterestRateDecimal = this.bid.minInterestRate
      .div(decimals).times(100).toFixed(2);
    return '%' + minInterestRateDecimal.toString();
  }
}

module.exports = BidDecorator;
