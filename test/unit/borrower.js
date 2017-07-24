import mockyeah from 'mockyeah';
import mockfs from 'mock-fs'
import Borrower from '../../src/Borrower';
import Dharma from 'dharma-js';
import {web3, util} from '../init.js';
import LoanUtils from '../utils/LoanUtils';
import Authenticate from '../../src/Authenticate';
import {AuthenticationError, RejectionError} from '../../src/Errors';
import expect from 'expect.js';
import sinon from 'sinon';
import uuidV4 from 'uuid/v4';
import _ from 'lodash';

const authenticate = new Authenticate();
const loanUtils = new LoanUtils(web3);

describe('Borrower', () => {
  const amount = web3.toWei(1, 'ether');
  let signedLoanData;
  let borrower;
  let dharma;
  let loan;
  let winningBids;

  afterEach(() => mockyeah.reset());
  after(() => {
    mockfs.restore()
    mockyeah.close()
  });

  before(() => {
    mockfs();
    dharma = new Dharma(web3);
    borrower = new Borrower(dharma, 'http://localhost:4001')
  })

  describe('#requestAttestation()', () => {
    before(async () => {
      signedLoanData = await loanUtils.generateSignedLoanData({
        borrower: ACCOUNTS[0],
        attestor: ACCOUNTS[1],
        amount: amount
      })
    })

    it('should throw authentication error if auth key is not locally present', async () => {
      try {
        await borrower.requestAttestation(ACCOUNTS[0], amount);
        expect().fail("should throw error");
      } catch (err) {
        expect(err.type).to.be('AuthenticationError');
      }
    })

    it('should throw authentication error if auth token is invalid', async () => {
      await authenticate.setAuthKey('invalid');

      mockyeah.get('/requestLoan', {
        json: {
          error: 'INVALID_AUTH_TOKEN'
        }
      })

      try {
        await borrower.requestAttestation(ACCOUNTS[0], amount);
        expect().fail("should throw error");
      } catch (err) {
        expect(err.type).to.be('AuthenticationError');
      }
    })

    it('should return rejected attestation obj if rejection', async () => {
      await authenticate.setAuthKey('abcdefghijklmnopqrstuvwxyz');

      mockyeah.get('/requestLoan', {
        json: {
          error: 'LOAN_REQUEST_REJECTED'
        }
      })

      try {
        await borrower.requestAttestation(ACCOUNTS[0], amount);
        expect().fail("should throw error");
      } catch (err) {
        expect(err.type).to.be('RejectionError');
      }
    })

    it('should return attestation if successful', async () => {
      mockyeah.get('/requestLoan', {
        json: signedLoanData
      })

      loan = await borrower.requestAttestation(ACCOUNTS[0], amount);
      expect(loan.uuid).to.equal(signedLoanData.uuid);
    })
  })

  describe('#requestLoan(deployedCallback, reviewCallback)', () => {
    let bids;
    let expectedWinningBids;
    let expectedInterestRate;

    describe('reviewCallback -- principal met', () => {
      let deployedCallback = sinon.spy();
      let reviewCallback = sinon.spy();

      before(function (done) {
        loanUtils.simulateAuction(borrower, loan,
          deployedCallback, reviewCallback, done).then((testBidSet) => {
            bids = testBidSet.bids;
            expectedWinningBids = testBidSet.expectedWinningBids;
            expectedInterestRate = testBidSet.expectedInterestRate;
        });
      })

      it('should call the deployed callback once the loan is deployed', () => {
        expect(deployedCallback.calledOnce).to.be(true);
      })

      it('should call reviewCallback once the loan is bid on w/ best interest rate', () => {
        winningBids = reviewCallback.args[0][1].bids;
        for (let i = 0; i < winningBids.length; i++) {
          expect(winningBids[i].bidder).to.be(expectedWinningBids[i].bidder)
          expect(winningBids[i].amount
            .equals(expectedWinningBids[i].amount)).to.be(true)
        }

        expect(reviewCallback.args[0][1].interestRate
          .equals(web3.toWei(expectedInterestRate, 'ether'))).to.be(true);
        expect(reviewCallback.calledOnce).to.be(true);
      })
    })

    describe('reviewCallback -- principal unmet', () => {
      let deployedCallback = sinon.spy();
      let reviewCallback = sinon.spy();
      let failedLoanData;
      let failedLoan;

      before((done) => {
        loanUtils.generateSignedLoanData({
          borrower: ACCOUNTS[0],
          attestor: ACCOUNTS[1],
          amount: amount
        }).then((loan) => {
          mockyeah.get('/requestLoan', {
            json: loan
          })

          return borrower.requestAttestation(ACCOUNTS[0], amount);
        }).then((loan) => {
          return loanUtils.simulateFailedAuction(borrower, loan,
            deployedCallback, reviewCallback, done)
        }).catch((err) => {
          console.log(err);
        });
      })

      it('should call the deployed callback once the loan is deployed', async () => {
        expect(deployedCallback.calledOnce).to.be(true);
        expect(deployedCallback.args[0][0]).to.be(null);
      })

      it('it should call reviewCallback with error', () => {
        expect(reviewCallback.calledOnce).to.be(true);
        expect(_.isEqual(reviewCallback.args[0][0], {
          error: 'PRINCIPAL_UNMET'
        })).to.be(true);
      })
    })
  })

  describe('#acceptTerms(loanAccepted)', () => {
    it('should call loanAccepted once the loan has been accepted', (done) => {
      web3.eth.getBalance(loan.borrower, (err, balanceBefore) => {
        borrower.acceptLoanTerms(loan, winningBids, (err, result) => {
          if (err) console.log(err);
          web3.eth.getBalance(loan.borrower, (err, balanceAfter) => {
            expect(balanceAfter.gt(balanceBefore)).to.be(true);
            done();
          });
        })
      })
    })
  })
})
