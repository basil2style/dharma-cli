import BigNumber from 'bignumber.js';
import LoanDecorator from './LoanDecorator';

const decimals = new BigNumber(10**18);

class InvestmentDecorator {
  constructor(investment) {
    this.investment = investment;
    this.loanDecorator = new LoanDecorator(investment.loan);
  }

  uuid() {
    return this.loanDecorator.uuid();
  }

  borrower() {
    return this.loanDecorator.borrower();
  }

  interestRate() {
    return this.loanDecorator.interestRate();
  }

  principal() {
    return this.loanDecorator.principal();
  }


  defaultRisk() {
    return this.loanDecorator.defaultRisk();
  }

  amountRepaid() {
    const amountRepaidDecimal =
      this.investment.amountRepaid.div(decimals).toFixed(2);
    return '\u039E' + amountRepaidDecimal.toString();
  }

  static individualRepayment(amount) {
    const individualRepaymentEther = amount.div(decimals).toFixed(2);
    return '\u039E' + individualRepaymentEther.toString();
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
