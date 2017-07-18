import blessed from 'blessed';
import contrib from 'blessed-contrib';
import LoanDecorator from '../decorators/LoanDecorator';
import emoji from 'node-emoji';
import _ from 'lodash';

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
  constructor(onLoanSelect) {
    this.table = contrib.table(tableStyle)
    this.onLoanSelect = onLoanSelect;
    this.table.rows.on('select item', function (item, index) {
      this.onLoanSelect(index);
    }.bind(this));
    this.loans = [];
  }

  getNode() {
    return this.table;
  }

  render(loans) {
    if (_.isEqual(this.loans, loans))
      return;

    this.loans = loans;
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
