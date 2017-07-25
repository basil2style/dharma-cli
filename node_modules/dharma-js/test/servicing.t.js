import {LoanInAcceptedState} from './util/TestLoans';
import {web3, util} from './init';
import expect from 'expect.js';
import MockDate from 'mockdate';
import moment from 'moment';


describe('Servicing', () => {
  describe('#expectedAmountRepaidByDate()', () => {
    let loan;
    let date;

    describe('Daily non-compounded', () => {
      let expectedPeriodicRepayment;

      before(async () => {
        loan = await LoanInAcceptedState(ACCOUNTS, {
          terms: {
            version: 1,
            periodType: 'daily',
            periodLength: 3,
            termLength: 2,
            compounded: false
          }
        })

        await util.pause(3)

        date = new Date();

        const decimals = web3.toWei(1, 'ether');
        let interestRate = loan.interestRate
        interestRate = interestRate.div(decimals).plus(1);

        const principal = loan.principal;
        expectedPeriodicRepayment = interestRate.times(principal).div(2);
      })

      it("should return correct amount for 1 day into term", () => {
        date.setDate(date.getDate() + 1)
        const expectedAmountRepaid = loan.servicing.expectedAmountRepaidByDate(date)
        expect(expectedAmountRepaid.equals(0)).to.be(true);
      })

      it("should return correct amount for 4 days into term", async () => {
        date.setDate(date.getDate() + 3)
        const returnedExpectedAmountRepaid = loan.servicing.expectedAmountRepaidByDate(date)
        expect(returnedExpectedAmountRepaid
          .equals(expectedPeriodicRepayment)).to.be(true);
      })

      it("should return correct amount for 7 days into term", () => {
        date.setDate(date.getDate() + 3)
        const returnedExpectedAmountRepaid = loan.servicing.expectedAmountRepaidByDate(date)

        expect(returnedExpectedAmountRepaid
          .equals(expectedPeriodicRepayment.times(2))).to.be(true);
      })
    });

    describe('Weekly non-compounded', () => {
      let expectedPeriodicRepayment;

      before(async () => {
        loan = await LoanInAcceptedState(ACCOUNTS, {
          terms: {
            version: 1,
            periodType: 'weekly',
            periodLength: 1,
            termLength: 4,
            compounded: false
          }
        })

        await util.pause(3)

        date = new Date();

        const decimals = web3.toWei(1, 'ether');
        let interestRate = loan.interestRate;
        interestRate = interestRate.div(decimals).plus(1);

        const principal = loan.principal;
        expectedPeriodicRepayment = interestRate.times(principal).div(4);
      })

      it('should return correct amount for 3 days into term', () => {
        date.setDate(date.getDate() + 3)
        const expectedAmountRepaid = loan.servicing.expectedAmountRepaidByDate(date)
        expect(expectedAmountRepaid.equals(0)).to.be(true);
      })

      it('should return correct amount for 10 days into term', () => {
        date.setDate(date.getDate() + 7)
        const returnedExpectedAmountRepaid = loan.servicing.expectedAmountRepaidByDate(date)
        expect(returnedExpectedAmountRepaid
          .equals(expectedPeriodicRepayment)).to.be(true);
      })

      it('should return correct amount for 17 days into term', () => {
        date.setDate(date.getDate() + 7)
        const returnedExpectedAmountRepaid = loan.servicing.expectedAmountRepaidByDate(date)
        expect(returnedExpectedAmountRepaid
          .equals(expectedPeriodicRepayment.times(2))).to.be(true);
      })

      it('should return correct amount for 24 days into term', () => {
        date.setDate(date.getDate() + 7)
        const returnedExpectedAmountRepaid = loan.servicing.expectedAmountRepaidByDate(date)
        expect(returnedExpectedAmountRepaid
          .equals(expectedPeriodicRepayment.times(3))).to.be(true);
      })

      it('should return correct amount for 31 days into term', () => {
        date.setDate(date.getDate() + 7)
        const returnedExpectedAmountRepaid = loan.servicing.expectedAmountRepaidByDate(date)
        expect(returnedExpectedAmountRepaid
          .equals(expectedPeriodicRepayment.times(4))).to.be(true);
      })
    });

    describe('Monthly non-compounded', () => {
      let expectedPeriodicRepayment;

      before(async () => {
        loan = await LoanInAcceptedState(ACCOUNTS, {
          terms: {
            version: 1,
            periodType: 'monthly',
            periodLength: 1,
            termLength: 2,
            compounded: false
          }
        })

        await util.pause(3)

        date = new Date();

        const decimals = web3.toWei(1, 'ether');
        let interestRate = await loan.getInterestRate();
        interestRate = interestRate.div(decimals).plus(1);

        const principal = loan.principal;
        expectedPeriodicRepayment = interestRate.times(principal).div(2);
      });

      it('should return correct amount 25 days into term', () => {
        date.setDate(date.getDate() + 25)
        const expectedAmountRepaid = loan.servicing.expectedAmountRepaidByDate(date)
        expect(expectedAmountRepaid.equals(0)).to.be(true);
      })

      it('should return correct amount 50 days into term', () => {
        date.setDate(date.getDate() + 25)
        const returnedExpectedAmountRepaid = loan.servicing.expectedAmountRepaidByDate(date)
        expect(returnedExpectedAmountRepaid
          .equals(expectedPeriodicRepayment)).to.be(true);
      })

      it('should return correct amount 75 days into term', () => {
        date.setDate(date.getDate() + 25)
        const returnedExpectedAmountRepaid = loan.servicing.expectedAmountRepaidByDate(date)
        expect(returnedExpectedAmountRepaid
          .equals(expectedPeriodicRepayment.times(2))).to.be(true);
      });
    });

    describe('Yearly non-compounded', () => {
      let expectedPeriodicRepayment;

      before(async () => {
        loan = await LoanInAcceptedState(ACCOUNTS, {
          terms: {
            version: 1,
            periodType: 'yearly',
            periodLength: 1,
            termLength: 2,
            compounded: false
          }
        })

        await util.pause(3)

        date = new Date();

        const decimals = web3.toWei(1, 'ether');
        let interestRate = await loan.getInterestRate();
        interestRate = interestRate.div(decimals).plus(1);

        const principal = loan.principal;
        expectedPeriodicRepayment = interestRate.times(principal).div(2);
      })

      it('should return correct amount 300 days into term', () => {
        date.setDate(date.getDate() + 300)
        const expectedAmountRepaid = loan.servicing.expectedAmountRepaidByDate(date)
        expect(expectedAmountRepaid.equals(0)).to.be(true);
      })

      it('should return correct amount 600 days into term', () => {
        date.setDate(date.getDate() + 300)
        const returnedExpectedAmountRepaid = loan.servicing.expectedAmountRepaidByDate(date)
        expect(returnedExpectedAmountRepaid
          .equals(expectedPeriodicRepayment)).to.be(true);
      })

      it('should return correct amount 900 days into term', () => {
        date.setDate(date.getDate() + 300)
        const returnedExpectedAmountRepaid = loan.servicing.expectedAmountRepaidByDate(date)
        expect(returnedExpectedAmountRepaid
          .equals(expectedPeriodicRepayment.times(2))).to.be(true);
      })
    });
  })

  describe('#getRepaymentStatus', () => {
    let loan;
    let date;
    let amountOwed;
    let periodicRepaymentOwed;

    beforeEach(async () => {
      loan = await LoanInAcceptedState(ACCOUNTS, {
        terms: {
          version: 1,
          periodType: 'weekly',
          periodLength: 1,
          termLength: 2,
          compounded: false
        }
      })

      await util.pause(3)

      date = new Date();

      const decimals = web3.toWei(1, 'ether');
      let interestRate = await loan.getInterestRate();
      interestRate = interestRate.div(decimals).plus(1);

      const principal = loan.principal;

      amountOwed = interestRate.times(principal);
      periodicRepaymentOwed = amountOwed.div(2);
    })

    afterEach(MockDate.reset);

    describe('repaid in full', () => {
      beforeEach(async () => {
        const date = moment().add(15, 'days').toDate();
        MockDate.set(date);
        await loan.repay(amountOwed);
      })

      it ('should classify the loan as REPAID', async () => {
        const status = await loan.servicing.getRepaymentStatus();
        expect(status).to.be('REPAID');
      })
    });

    describe('current', () => {
      beforeEach(async () => {
        const date = moment().add(10, 'days').toDate();
        MockDate.set(date);
        await loan.repay(amountOwed.div(2));
      })

      it ('should classify the loan as CURRENT', async () => {
        const status = await loan.servicing.getRepaymentStatus();
        expect(status).to.be('CURRENT');
      })
    })

    describe('delinquent in part', () => {
      beforeEach(async () => {
        const date = moment().add(20, 'days').toDate();
        MockDate.set(date);
        await loan.repay(amountOwed.times(0.6));
      })

      it ('should classify the loan as DELINQUENT', async () => {
        const status = await loan.servicing.getRepaymentStatus();
        expect(status).to.be('DELINQUENT');
      })
    });

    describe('delinquent in full', () => {
      beforeEach(async () => {
        const date = moment().add(20, 'days').toDate();
        MockDate.set(date);
      })

      it ('should classify the loan as DELINQUENT', async () => {
        const status = await loan.servicing.getRepaymentStatus();
        expect(status).to.be('DELINQUENT');
      })
    });

    describe('defaulted in part', () => {
      beforeEach(async () => {
        const date = moment().add(30, 'days').toDate();
        MockDate.set(date);
        await loan.repay(amountOwed.times(0.6));
      })

      it ('should classify the loan as DEFAULT', async () => {
        const status = await loan.servicing.getRepaymentStatus();
        expect(status).to.be('DEFAULT');
      })
    });

    describe('defaulted in full', () => {
      beforeEach(async () => {
        const date = moment().add(30, 'days').toDate();
        MockDate.set(date);
      })

      it ('should classify the loan as DEFAULT', async () => {
        const status = await loan.servicing.getRepaymentStatus();
        expect(status).to.be('DEFAULT');
      })
    });
  })
})
