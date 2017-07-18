class TermsDecorator {
  constructor(loan) {
    this.loan = loan;
  }

  term() {
    const termLength = this.loan.terms.termLength;
    const periodLength = this.loan.terms.periodLength;
    const periodType = this.loan.terms.periodType;
    const numUnits = termLength * periodLength;


    let termString = numUnits.toString() + ' ' + this._timeUnit(periodType);
    if (numUnits > 1) {
      termString += 's';
    }

    return termString;
  }

  amortization() {
    const periodLength = this.loan.terms.periodLength;
    const periodType = this.loan.terms.periodType;

    let amortizationString = 'Repayments due every '
    if (periodLength > 1) {
      amortizationString += periodLength + this._timeUnit(periodType) + 's'
    } else {
      amortizationString += this._timeUnit(periodType)
    }

    return amortizationString;
  }

  startDate() {
    const termBeginTimestamp = this.loan.termBeginTimestamp.times(1000);
    const termBeginDate = new Date(termBeginTimestamp.toNumber());
    return termBeginDate.toString();
  }

  _timeUnit(periodType) {
    switch (periodType) {
      case 'daily':
        return 'day';
        break;
      case 'weekly':
        return 'week';
        break;
      case 'monthly':
        return 'month';
        break;
      case 'yearly':
        return 'year';
        break;
    }
  }
}

module.exports = TermsDecorator;
