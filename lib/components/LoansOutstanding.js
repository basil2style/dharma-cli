import blessed from 'blessed';
import contrib from 'blessed-contrib';
import LoanDecorator from '../decorators/LoanDecorator';
import emoji from 'node-emoji';

const tableStyle = {
  top: 0,
  left: 0,
  label: 'Loans Outstanding',
  width: "70%",
  height: "60%",
  fg: 'white',
  selectedFg: 'white',
  selectedBg: '#007f00',
  interactive: true,
  border: {
    type: 'line',
    fg: 'cyan'
  },
  style: {
    bold: true,
    fg: 'green',
  },
  keys: true,
  columnWidth: [14, 14, 10, 10, 14, 12, 12],
  columnSpacing: 6
}

const headers = ['UUID', 'BORROWER', 'PRINCIPAL', 'INTEREST', 'ATTESTOR', 'ATTESTOR FEE', 'DEFAULT RISK']

class LoansOutstanding {
  constructor() {
    this.table = contrib.table(tableStyle)
  }

  getNode() {
    return this.table;
  }

  render(loans) {
    let loanList = [];
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

    this.table.focus()
    this.table.setData({
      headers: headers,
      data: loanList
    })
  }
}

module.exports = LoansOutstanding;
