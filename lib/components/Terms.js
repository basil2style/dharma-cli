import blessed from 'blessed';
import TermsDecorator from '../decorators/TermsDecorator';
import _ from 'lodash';

const listStyle = {
  left: '70%',
  width: '30%',
  height: '30%',
  label: 'Loan Terms',
  border: {
    type: 'line',
    fg: 'cyan'
  },
  style: {
    fg: '#007f00'
  },
  interactive: false
}

class Terms {
  constructor() {
    this.list = blessed.list(listStyle)
    this.currentIndex = -1;
  }

  getNode() {
    return this.list;
  }

  render(visibleTermsIndex, loans) {
    if (visibleTermsIndex == this.currentIndex || loans.length == 0)
      return;

    this.currentIndex = visibleTermsIndex;
    const terms = loans[visibleTermsIndex].terms;
    const decorator = new TermsDecorator(loans[visibleTermsIndex]);
    let termsList = [
      "Term: " + decorator.term(),
      "Term Start: " + decorator.startDate(),
      "Amortization: " + decorator.amortization(),
      "Compounded: No",
      "Repayment Grace Period: 2 weeks"
    ]

    this.list.setItems(termsList);
  }
}

module.exports = Terms;
