import blessed from 'blessed';
import contrib from 'blessed-contrib';
import InvestmentDecorator from '../decorators/InvestmentDecorator';
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
  columnWidth: [14, 14, 10, 14, 10, 14, 14],
  columnSpacing: 6
}

const headers = ['UUID', 'PRINCIPAL', 'INTEREST', 'DEFAULT RISK', 'BALANCE', 'REPAY STATUS', 'AMT REPAID']

class LoansOutstanding {
  constructor(onLoanSelect) {
    this.table = contrib.table(tableStyle)
    this.onLoanSelect = onLoanSelect;
    this.investments = [];
    this.table.focus();
    this.selected = 0;

    this.selectDown = this.selectDown.bind(this);
    this.selectUp = this.selectUp.bind(this);
  }

  getNode() {
    return this.table;
  }

  selectDown() {
    if (this.selected == this.investments.length - 1)
      return;

    this.selected += 0.5;
    
    if (this.selected % 1 === 0) {
      this.onLoanSelect(this.selected);
    }
  }

  selectUp() {
    if (this.selected == 0)
      return;

    this.selected -= 0.5;

    if (this.selected % 1 === 0) {
      this.onLoanSelect(this.selected);
    }
  }

  render(investments) {
    this.investments = investments;
    let investmentList = [];
    investments.forEach((investment) => {
      const decorator = new InvestmentDecorator(investment);
      investmentList.push([
        decorator.uuid(),
        decorator.principal(),
        decorator.interestRate(),
        decorator.defaultRisk(),
        decorator.balance(),
        decorator.repaymentStatus(),
        decorator.amountRepaid()
      ])
    })

    this.table.setData({
      headers: headers,
      data: investmentList
    })
    this.table.rows.select(this.selected);
  }
}

module.exports = LoansOutstanding;
