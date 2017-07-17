import blessed from 'blessed';
import LoanDecorator from '../decorators/LoanDecorator';
import emoji from 'node-emoji';

const containerStyle = {
  top: 0,
  left: 0,
  label: 'Loans Outstanding',
  width: "60%",
  height: "60%",
  border: {
    type: 'line'
  },
  style: {
    border: {
      fg: 'cyan'
    }
  }
}

const boxStyle = {
  width: '95%',
  height: '95%',
  top: 'center',
  left: 'center'
}

const listStyle = {
  top: 0,
  left: 0,
  width: '5%',
  height: '100%',
  align: 'center',
  keys: true
}

const listTableStyle = {
  top: 0,
  left: '5%',
  width: '95%',
  height: '100%',
  align: 'center',
  style: {
    header: {
      bg: 'cyan'
    }
  },
  noCellBorders: true
}

const headers = ['UUID', 'BORROWER', 'PRINCIPAL', 'INTEREST', 'ATTESTOR', 'ATTESTOR FEE', 'DEFAULT RISK']

class LoansOutstanding {
  constructor() {
    this.container = blessed.box(containerStyle);
    this.box = blessed.box(boxStyle);
    this.listTable = blessed.listtable(listTableStyle);
    this.listTable.setData([headers]);
    this.list = blessed.list(listStyle);
    this.selected = 1;

    this.box.append(this.list);
    this.box.append(this.listTable);

    this.container.append(this.box);
  }

  getNode() {
    return this.container;
  }

  render(loans) {
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
    let stubList = Array(loanList.length).fill("")
    stubList[this.selected] = emoji.get('coffee');

    this.listTable.setData(loanList);
    this.list.setItems(stubList);
    this.list.select(this.selected);
    this.list.on('select item', function (item, index) {
      this.selected = index;
      this.list.setItem(emoji.get('coffee'), "");
      this.list.setItem(index, emoji.get('coffee'));
    }.bind(this))
    this.list.focus();
  }
}

module.exports = LoansOutstanding;
