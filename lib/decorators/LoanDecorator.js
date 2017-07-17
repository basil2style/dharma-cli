import BigNumber from 'bignumber.js';

const decimals = new BigNumber(10**18);

class LoanDecorator {
  constructor(loan) {
    this.loan = loan;
  }

  uuid() {
    return this.loan.uuid.slice(0,10) + "...";
  }

  borrower() {
    return this.loan.borrower.slice(0,10) + "...";
  }

  attestor() {
    return this.loan.attestor.slice(0,10) + "...";
  }

  interestRate() {
    const interestRateDecimal = this.loan.interestRate
      .div(decimals).times(100).toFixed(2);
    return '%' + interestRateDecimal.toString();
  }

  principal() {
    const principalDecimal = this.loan.principal.div(decimals).toFixed(2);
    return '\u039E' + principalDecimal.toString();
  }

  attestorFee() {
    const attestorFeeDecimal = this.loan.attestorFee.div(decimals).toFixed(4);
    return '\u039E' + attestorFeeDecimal.toString();
  }

  defaultRisk() {
    const defaultRiskDecimal = this.loan.defaultRisk
      .div(decimals).times(100).toFixed(2);
    return '%' + defaultRiskDecimal.toString();
  }
}

module.exports = LoanDecorator;
