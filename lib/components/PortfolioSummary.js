import blessed from 'blessed';
import SummaryDecorator from '../decorators/SummaryDecorator';

const containerStyle = {
  top: '30%',
  left: '70%',
  width: '30%',
  height: '30%',
  label: 'Portfolio Summary',
  border: {
    type: 'line',
    fg: 'cyan'
  }
}

const labelListStyle =  {
  left: '5%',
  top: '10%',
  width: '50%',
  align: 'left',
  items: [
    'Principal Outstanding:',
    "",
    'Interest Earned:',
    "",
    'Total Cash:',
    "",
    'Defaulted Loans:',
    ""
  ]
}

const valueListStyle = {
  left: '45%',
  top: '10%',
  width: '50%',
  align: 'right',
  style:  {
    fg: 'green'
  },
  interactive: false
}

const dividerStyle = {
  width: '90%',
  top: '70%',
  left: 'center',
  style: {
    fg: 'cyan'
  },
  orientation: 'horizontal'
}

const totalLabelStyle = {
  top: '75%',
  left: '5%',
  content: 'Total Value:'
}

const totalValueStyle = {
  top: '75%',
  left: '45%',
  width: '50%',
  align: 'right',
  interactive: false,
  style: {
    fg: 'green'
  }
}

class PortfolioSummary {
  constructor() {
    this.container = blessed.box(containerStyle)
    this.labelList = blessed.list(labelListStyle)
    this.valueList = blessed.list(valueListStyle);
    this.divider = blessed.line(dividerStyle);
    this.totalLabel = blessed.text(totalLabelStyle);
    this.totalValueText = blessed.list(totalValueStyle);

    this.container.append(this.labelList);
    this.container.append(this.valueList);
    this.container.append(this.divider);
    this.container.append(this.totalLabel);
    this.container.append(this.totalValueText);
  }

  getNode() {
    return this.container
  }

  render(summary) {
    if (summary.length == 0)
      return;

    const decorator = new SummaryDecorator(summary);
    const toBeRendered = [
      decorator.principalOutstanding(),
      "",
      decorator.interestEarned(),
      "",
      decorator.totalCash(),
      "",
      decorator.defaultedValue(),
      ""
    ]

    this.valueList.setItems(toBeRendered)

    this.totalValueText.setItems([decorator.totalValue()])
  }
}

module.exports = PortfolioSummary;
