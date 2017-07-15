import LoanUtils from '../utils/LoanUtils'
import {web3, util} from '../init';
import mock from 'mock-fs';
import Dharma from 'dharma';
import Portfolio from '../../src/models/Portfolio';
import Investor from '../../src/Investor';
import MockDate from 'mockdate';
import expect from 'expect.js';
import moment from 'moment';
import _ from 'lodash';

class DecisionEngineStub {
  constructor(web3) {
    this.web3 = web3;
  }

  async decide(loan) {
    return {
      amount: this.web3.toWei(1.001, 'ether'),
      minInterestRate: this.web3.toWei(0.10, 'ether')
    }
  }
}

class WalletStub {
  constructor() {}

  getAddress() {
    return ACCOUNTS[13];
  }
}

const loanUtils = new LoanUtils(web3);
const dharma = new Dharma(web3);
const walletStub = new WalletStub();

describe('Portfolio', () => {
  let investor;
  let loans;
  let termBeginDate;
  let amountOwedLoanOne;

  before(async () => {
    /*
      Generate Portfolio w/
        1. Loan repaid in full
        2. Loan delinquent in part
        3. Loan defaulted in part
        4. Loan delinquent in full
        5. Loan defaulted in full
        6. Current loan

      (All in v0 non-amortized schedules)
    */

    // Loan repaid in full

    const address = ACCOUNTS[13]
    mock();

    investor = new Investor(dharma, walletStub, DecisionEngineStub);
    await investor.startDaemon((err) => { throw err });

    const investments = [
      // 1. Loan repaid in full
      loanUtils.generatePortfolioInvestment(address, {
        defaultRisk: web3.toWei(0.10, 'ether'),
        terms: LoanUtils.v1TermsDefault({ termLength: 1 })
      }),
      // 2. Loan delinquent in part
      loanUtils.generatePortfolioInvestment(address, {
        defaultRisk: web3.toWei(0.22, 'ether'),
        terms: LoanUtils.v1TermsDefault({ termLength: 1, periodLength: 2 })
      }),
      // 3. Loan defaulted in part
      loanUtils.generatePortfolioInvestment(address, {
        defaultRisk: web3.toWei(0.23, 'ether'),
        terms: LoanUtils.v1TermsDefault({ termLength: 1 })
      }),
      // 4. Loan delinquent in full
      loanUtils.generatePortfolioInvestment(address, {
        defaultRisk: web3.toWei(0.80, 'ether'),
        terms: LoanUtils.v1TermsDefault({ termLength: 1, periodLength: 2 })
      }),
      // 5. Loan defaulted in full
      loanUtils.generatePortfolioInvestment(address, {
        defaultRisk: web3.toWei(0.9, 'ether'),
        terms: LoanUtils.v1TermsDefault({ termLength: 1 })
      }),
      // 6. Current loan
      loanUtils.generatePortfolioInvestment(address, {
        defaultRisk: web3.toWei(0.55, 'ether'),
        terms: LoanUtils.v1TermsDefault({ termLength: 1, periodLength: 4 })
      })
    ];

    loans = await Promise.all(investments);

    termBeginDate = new Date();

    await util.pause(1);

    amountOwedLoanOne = loans[0].servicing.totalOwed();

    // 1. Paid back in full
    await loans[0].repay(amountOwedLoanOne);
    // 2. Paid back in part
    await loans[1].repay(web3.toWei(0.66, 'ether'));
    // 3. Paid back in part
    await loans[2].repay(web3.toWei(0.66, 'ether'));
    // 4. Fully defaulted
    // 5. Fully defaulted
    // 6. Current -- before payment date.

    await util.pause(2);
  })

  after(() => {
    mock.restore()
    MockDate.reset();
  });

  describe("3 weeks into loans' terms", () => {
    let presentDate;

    before(() => {
      presentDate = moment().add(22, 'days').toDate();
      MockDate.set(presentDate);
    })

    it("should set the date 20 days into the future", () => {
      expect(presentDate - termBeginDate > 20*24*60*60*1000).to.be(true);
    })

    describe('#getRiskProfile()', () => {
      it("should return the correct portfolio risk profile", () => {
        const expectedRiskProfile = {
          '0-20': web3.toWei(1, 'ether'),
          '21-40': web3.toWei(2, 'ether'),
          '41-60': web3.toWei(1, 'ether'),
          '61-80': web3.toWei(1, 'ether'),
          '81-100': web3.toWei(1, 'ether')
        }
        const riskProfile = investor.portfolio.getRiskProfile();

        Object.keys(riskProfile).forEach((tranche) => {
          expect(riskProfile[tranche].equals(expectedRiskProfile[tranche]))
            .to.be(true);
        })
      })
    })

    describe('#getTotalCash()', async () => {
      it("should return the correct amount of cash", async () => {
        const expectedTotalCash = await util.getBalance(ACCOUNTS[13]);

        const totalCash = await investor.portfolio.getTotalCash();
        expect(totalCash.equals(expectedTotalCash)).to.be(true);
      })
    })

    describe('#getTotalValue()', () => {
      it("should return the correct total value", async () => {
        // Total Value = cash + principal repaid + interest repaid
        let expectedTotalValue = await util.getBalance(ACCOUNTS[13]);
        expectedTotalValue = expectedTotalValue.plus(amountOwedLoanOne.plus(web3.toWei(1.32, 'ether')))

        const totalValue = await investor.portfolio.getTotalValue();
        expect(totalValue.equals(expectedTotalValue)).to.be(true);
      })
    })

    describe('#getLoans()', () => {
      it("should return the correct loan set", async () => {
        const returnedLoans = investor.portfolio.getLoans();
        loans.forEach((loan) => {
          const isLoanReturned = _.some(returnedLoans, (returnedLoan) => {
            return returnedLoan.equals(loan);
          })
          expect(isLoanReturned).to.be(true);
        })

        expect(returnedLoans.length).to.be(loans.length);
      })
    })

    describe('#getLoansOutstanding()', () => {
      it("should return the correct loan set", async () => {
        const returnedOutstandingLoans = await investor.portfolio.getLoansOutstanding();
        const outstandingLoans = loans.slice(1);

        outstandingLoans.forEach((loan) => {
          const isLoanReturned = _.some(returnedOutstandingLoans, (returnedLoan) => {
            return returnedLoan.equals(loan);
          })
          expect(isLoanReturned).to.be(true);
        })

        expect(returnedOutstandingLoans.length).to.be(outstandingLoans.length);
      })
    })

    describe('#getDelinquentLoans()', () => {
      it("should return the correct loan set", async () => {
        const returnedDelinquentLoans = await investor.portfolio.getDelinquentLoans();
        const delinquentLoans = [loans[1], loans[3]];

        delinquentLoans.forEach((loan) => {
          const isLoanReturned = _.some(returnedDelinquentLoans, (returnedLoan) => {
            return returnedLoan.equals(loan);
          })
          expect(isLoanReturned).to.be(true);
        })

        expect(returnedDelinquentLoans.length).to.be(delinquentLoans.length);
      });
    })

    describe('#getDefaultedLoans()', () => {
      it("should return the correct loan set", async () => {
        const returnedDefaultedLoans = await investor.portfolio.getDefaultedLoans();
        const defaultedLoans = [loans[2], loans[4]];

        defaultedLoans.forEach((loan) => {
          const isLoanReturned = _.some(returnedDefaultedLoans, (returnedLoan) => {
            return returnedLoan.equals(loan);
          })
          expect(isLoanReturned).to.be(true);
        })

        expect(returnedDefaultedLoans.length).to.be(defaultedLoans.length);
      });
    })

    describe('#getTotalInterestEarned()', () => {
      it("should return the correct amount of interest earned", async () => {
        const totalInterestEarned = await investor.portfolio.getTotalInterestEarned();

        const expectedTotalInterestEarned = web3.toWei(0.22, 'ether');
        expect(totalInterestEarned.equals(expectedTotalInterestEarned)).to.be(true);
      });
    })
  })
})
