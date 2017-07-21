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

const cashListLabelStyle =  {
  left: '5%',
  top: '10%',
  width: '50%',
  align: 'left',
  items: [
    'Principal Collected:',
    'Interest Collected:',
    'Cash Deposited:'
  ]
}

const cashListValueStyle = {
  left: '45%',
  top: '10%',
  width: '50%',
  align: 'right',
  style:  {
    fg: 'green'
  },
  interactive: false
}

const cashFlowsListLabelStyle =  {
  left: '5%',
  top: '45%',
  width: '50%',
  align: 'left',
  items: [
    'Total Cash:',
    'Principal Outstanding:',
    'Defaulted Value:'
  ]
}

const cashFlowsListValueStyle = {
  left: '45%',
  top: '45%',
  width: '50%',
  align: 'right',
  style:  {
    fg: 'green'
  },
  interactive: false
}

const firstDividerStyle = {
  width: '90%',
  top: '35%',
  left: 'center',
  style: {
    fg: 'cyan'
  },
  orientation: 'horizontal'
}

const secondDividerStyle = {
  width: '90%',
  top: '65%',
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
    this.cashListLabels = blessed.list(cashListLabelStyle);
    this.cashListValues = blessed.list(cashListValueStyle);
    this.cashFlowsListLabels = blessed.list(cashFlowsListLabelStyle);
    this.cashFlowsListValues = blessed.list(cashFlowsListValueStyle);
    this.totalLabel = blessed.text(totalLabelStyle);
    this.totalValueText = blessed.list(totalValueStyle);

    this.firstDivider = blessed.line(firstDividerStyle);
    this.secondDivider = blessed.line(secondDividerStyle);

    this.container.append(this.cashListLabels);
    this.container.append(this.cashListValues);
    this.container.append(this.cashFlowsListLabels);
    this.container.append(this.cashFlowsListValues);

    this.container.append(this.firstDivider);
    this.container.append(this.secondDivider);

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

    this.cashListValues.setItems([
      decorator.principalCollected(),
      decorator.interestCollected(),
      decorator.cashDeposited(),
    ]);

    this.cashFlowsListValues.setItems([
      decorator.totalCash(),
      decorator.principalOutstanding(),
      decorator.defaultedValue(),
    ])

    this.totalValueText.setItems([decorator.totalValue()])
  }
}

module.exports = PortfolioSummary;
