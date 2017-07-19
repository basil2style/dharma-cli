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
  border: {
    type: 'line',
    fg: 'cyan'
  },
  style: {
    bold: true,
    fg: 'green',
  },
  keys: true,
  vi: true,
  columnWidth: [14, 14, 10, 10, 14, 12, 12],
  columnSpacing: 6
}

const headers = ['UUID', 'BORROWER', 'PRINCIPAL', 'INTEREST', 'DEFAULT RISK', 'STATUS', 'REPAID']

class LoansOutstanding {
  constructor(onLoanSelect) {
    this.table = contrib.table(tableStyle)
    this.onLoanSelect = onLoanSelect;
    this.table.rows.on('select item', function (item, index) {
      this.onLoanSelect(index);
    }.bind(this));
    this.loans = [];
    this.table.focus()

  }

  getNode() {
    return this.table;
  }

  render(investments) {
    const loans = investments.map((investment) => {
      return investment.loan;
    })

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
        decorator.defaultRisk()
      ])
    })

    this.table.setData({
      headers: headers,
      data: loanList
    })
  }
}

module.exports = LoansOutstanding;
