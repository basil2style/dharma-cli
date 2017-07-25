import TestLoans from './util/TestLoans';
import Loan from '../src/Loan';
import {web3, util} from './init';
import expect from 'expect.js';
import {NULL_STATE, AUCTION_STATE, REVIEW_STATE,
  ACCEPTED_STATE, REJECTED_STATE} from '../src/Constants';

describe('StateListeners', () => {
  let loan;

  beforeEach(async () => {
    loan = await Loan.create(web3, TestLoans.LoanDataUnsigned(ACCOUNTS, {
      auctionPeriodLength: 4
    }));
    await loan.signAttestation();
  })

  describe('NULL_STATE', () => {
    // NO LISTENERS IN NULL_STATE
  })

  describe('AUCTION_STATE', () => {
    beforeEach(async () => {
      await loan.broadcast();
      await util.pause(1)
    })

    it("should set state to REVIEW when state transitions to review", async () => {
      expect(loan.state.equals(AUCTION_STATE)).to.be(true);

      await util.pause(4)

      expect(loan.state.equals(REVIEW_STATE)).to.be(true);
    })
  })

  describe('REVIEW_STATE', () => {
    beforeEach(async () => {
      loan = await TestLoans.LoanInReviewState(ACCOUNTS, {
        reviewPeriodLength: 5
      });
      await util.pause(1)
    })

    describe('rejected', () => {
      it("should set state to REJECTED", async () => {
        await loan.rejectBids();
        await util.pause(3);
        expect(loan.state.equals(REJECTED_STATE)).to.be(true);
      })
    })

    describe('accepted', () => {
      it('should set state to ACCEPTED and populate interestRate / ' +
          'termBeginBlockNumber / termBeginTimestamp', async () => {
        await loan.acceptBids(ACCOUNTS.slice(2,7).map((account) => {
          return {
            bidder: account,
            amount: web3.toWei(0.2002, 'ether')
          }
        }), { from: loan.borrower })
        await util.pause(3);
        expect(loan.state.equals(ACCEPTED_STATE)).to.be(true);
        expect(loan.interestRate.gt(0)).to.be(true);
        expect(loan.termBeginBlockNumber > 0).to.be(true);
        expect(loan.termBeginTimestamp > 0).to.be(true);
      })
    });

    describe('ignored', () => {
      it('should set state to REJECTED when bids are ignored', async () => {
        await util.pause(12)
        expect(loan.state.equals(REJECTED_STATE)).to.be(true);
      })
    });
  })
})
