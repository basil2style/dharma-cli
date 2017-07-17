import blessed from 'blessed';
import LoanDecorator from '../deocrators/LoanDecorator';

const style = {
  top: 0,
  left: 0,
  width: "60%",
  height: "60%",
  align: 'left',
  border: {type: 'line'},
  noCellBorders: true,
  style: {fg: 'green', border: {fg: 'cyan'}}
}

class LoansOutstanding {
  constructor() {
    this.listTable = blessed.listTable(style);
  }

  getNode() {
    return this.listTable;
  }

  render(loans) {
    const headers = ['UUID', 'BORROWER', 'PRINCIPAL', 'INTEREST', 'ATTESTOR', 'ATTESTOR FEE', 'DEFAULT RISK']
    let loanList = [headers];
    loans.forEach((loan) => {
      const decorator = new LoanDecorator(loan);
      loanList.push([
        decorator.uuid(),
        decorator.borrower(),
        decorator.principal(),
        decorator.interestRate(),
        decorator.attestor(),
        decorator.attestorFee(),
        decorator.defaultRisk()
      ])
    })

    this.listTable.setData(loanList);
  }
}
