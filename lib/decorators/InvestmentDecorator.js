import BigNumber from 'bignumber.js';

const decimals = new BigNumber(10**18);

class InvestmentDecorator {
  constructor(investment) {
    this.investment = investment;
  }

  uuid() {
    return this.investment.loan.uuid.slice(0,10) + "...";
  }

  borrower() {
    return this.investment.loan.borrower.slice(0,10) + "...";
  }

  interestRate() {
    const interestRateDecimal = this.investment.loan.interestRate
      .div(decimals).times(100).toFixed(2);
    return '%' + interestRateDecimal.toString();
  }

  principal() {
    const principalDecimal =
      this.investment.loan.principal.div(decimals).toFixed(2);
    return '\u039E' + principalDecimal.toString();
  }


  defaultRisk() {
    const defaultRiskDecimal = this.investment.loan.defaultRisk
      .div(decimals).times(100).toFixed(2);
    return '%' + defaultRiskDecimal.toString();
  }

  amountRepaid() {
    const amountRepaidDecimal =
      this.investment.amountRepaid.div(decimals).toFixed(2);
    return '\u039E' + amountRepaidDecimal.toString();
  }

  balance() {
    const balanceDecimal =
      this.investment.balance.div(decimals).toFixed(2);
    return balanceDecimal.toString();
  }

  repaymentStatus() {
    return this.investment.repaymentStatus;
  }
}

module.exports = InvestmentDecorator;
