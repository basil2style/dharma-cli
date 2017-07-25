import BigNumber from 'bignumber.js';
import moment from 'moment';
import Constants from './Constants.js';

class Servicing {
  constructor(loan) {
    this.loan = loan;
  }

  expectedAmountRepaidByDate(date) {
    if (this.loan.state !== Constants.ACCEPTED_STATE)
      throw new Error('Loan must be in ACCEPTED state before servicing ' +
        'utilities can be accessed');

    const expectedPeriodicRepayment = this.periodicRepaymentOwed();

    const numRepaymentPeriods = this._numRepaymentPeriods(date);

    return expectedPeriodicRepayment.times(numRepaymentPeriods);
  }

  async getInterestRepaidToDate() {
    const amountRepaid = await this.loan.amountRepaid();
    const decimals = Math.pow(10, 18);

    let interestRate = this.loan.interestRate;
    interestRate = interestRate.div(decimals);

    return amountRepaid.times(interestRate).div(interestRate.plus(1))
  }

  async getPrincipalRepaidToDate() {
    const amountRepaid = await this.loan.amountRepaid();
    const interestRepaidToDate = await this.getInterestRepaidToDate();

    return amountRepaid.minus(interestRepaidToDate);
  }

  _numRepaymentPeriods(date) {
    const termBeginDate = new Date(this.loan.termBeginTimestamp*1000);
    const numPeriods = this._numPeriodsBetween(termBeginDate, date,
      this.loan.terms.periodType(), this.loan.terms.periodLength());
    return BigNumber.min(numPeriods, this.loan.terms.termLength())
  }

  async getRepaymentStatus() {
    const amountRepaid = await this.loan.amountRepaid();
    const expectedAmountRepaid = this.expectedAmountRepaidByDate(new Date());

    if (amountRepaid.gte(expectedAmountRepaid)) {
      const durationSinceTermBegin =
        moment.duration(moment().diff(this.loan.termBeginTimestamp*1000));
      if (durationSinceTermBegin < this.termDuration()) {
        return 'CURRENT';
      } else {
        return 'REPAID';
      }
    } else {
      const numPeriodsRepaid =
        amountRepaid.div(this.periodicRepaymentOwed()).floor().toNumber();
      const lastRepaymentDateMissed =
        moment(this.loan.termBeginTimestamp*1000)
          .add(this.periodDuration(numPeriodsRepaid + 1));
      const weeksSinceRepaymentDateMissed =
        moment.duration(moment().diff(lastRepaymentDateMissed)).asWeeks();

      if (weeksSinceRepaymentDateMissed <= 2) {
        return 'DELINQUENT';
      } else {
        return 'DEFAULT';
      }
    }
  }

  getRepaymentDates() {
    let dates = [];
    const termBeginDate = new Date(this.loan.termBeginTimestamp*1000);
    for (let i = 1; i <= this.loan.terms.termLength(); i++) {
      let repaymentDate = moment(termBeginDate)
        .add(this.periodDuration(i)).toDate()
      dates.push(repaymentDate);
    }
    return dates;
  }

  periodicRepaymentOwed() {
    return this.totalOwed().div(this.loan.terms.termLength());
  }

  totalOwed() {
    const decimals = Math.pow(10, 18);

    let interestRate = this.loan.interestRate;
    interestRate = interestRate.div(decimals).plus(1);

    const principal = this.loan.principal;
    return interestRate.times(principal)
  }

  async currentBalanceOwed() {
    const decimals = Math.pow(10, 18);

    const amountRepaid = await this.loan.amountRepaid();
    const expectedAmountRepaid = this.expectedAmountRepaidByDate(new Date());

    return BigNumber.max(expectedAmountRepaid.minus(amountRepaid), 0);
  }

  periodDuration(numPeriods=1) {
    switch(this.loan.terms.periodType()) {
      case 'daily':
        return moment.duration(numPeriods*this.loan.terms.periodLength(), 'days');
        break;
      case 'weekly':
        return moment.duration(numPeriods*this.loan.terms.periodLength(), 'weeks');
        break;
      case 'monthly':
        return moment.duration(numPeriods*this.loan.terms.periodLength(), 'months');
        break;
      case 'yearly':
        return moment.duration(numPeriods*this.loan.terms.periodLength(), 'years');
        break;
    }
  }

  termDuration() {
    return this.periodDuration(this.loan.terms.termLength());
  }

  _numPeriodsBetween(startDate, endDate, periodType, periodLength) {
    const startDateWrapper = moment(startDate);
    const endDateWrapper = moment(endDate);

    const timeDiff = moment.duration(endDateWrapper.diff(startDateWrapper))

    switch(periodType) {
      case 'daily':
        return Math.floor(timeDiff.asDays() / periodLength);
        break;
      case 'weekly':
        return Math.floor(timeDiff.asWeeks() / periodLength)
        break;
      case 'monthly':
        return Math.floor(timeDiff.asMonths() / periodLength)
        break;
      case 'yearly':
        return Math.floor(timeDiff.asYears() / periodLength)
        break;
    }
  }
}

module.exports = Servicing;
