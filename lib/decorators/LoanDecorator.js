import BigNumber from 'bignumber.js';

const decimals = new BigNumber(10**18);

class LoanDecorator {
  constructor(loan) {
    this.loan = loan;
  }

  interestRate() {
    const interestRateDecimal = this.loan.interestRate.div(decimals);
    return '%' + interestRateDecimal.toString();
  }

  principal() {
    const principalDecimal = this.loan.principal.div(decimals);
    return principalDecimal.toString();
  }
}

module.exports = LoanDecorator;
