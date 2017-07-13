import BigNumber from 'bignumber.js';

class LoanDecorator {
  constructor(loan) {
    this.loan = loan;
  }

  interestRate() {
    const decimals = new BigNumber(10**18);
    const interestRateDecimal = this.loan.interestRate.div(decimals);
    return '%' + interestRateDecimal.toString();
  }
}
