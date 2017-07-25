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

  interestRate() {
    const interestRateDecimal = this.loan.interestRate
      .div(decimals).times(100).toFixed(2);
    return '%' + interestRateDecimal.toString();
  }

  principal() {
    const principalDecimal =
      this.loan.principal.div(decimals).toFixed(2);
    return '\u039E' + principalDecimal.toString();
  }

  totalOwed() {
    const totalOwedEther =
      this.loan.servicing.totalOwed().div(decimals).toFixed(2);
    return '\u039E' + totalOwedEther.toString();
  }

  defaultRisk() {
    const defaultRiskDecimal = this.loan.defaultRisk
      .div(decimals).times(100).toFixed(2);
    return '%' + defaultRiskDecimal.toString();
  }

  async currentBalanceOwed() {
    const currentlyOwed = await this.loan.servicing.currentBalanceOwed();
    const currentlyOwedEther = currentlyOwed.div(decimals).toFixed(2);
    return '\u039E' + currentlyOwedEther.toString();
  }
}

module.exports = LoanDecorator;
