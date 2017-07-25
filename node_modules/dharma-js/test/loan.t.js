import Loan from '../src/Loan.js';
import LoanContract from '../src/contract_wrappers/LoanContract.js';
import Metadata from '../package.json';
import expect from 'expect.js';
import uuidV4 from 'uuid/v4';
import {web3, util} from './init.js';
import _ from 'lodash';
import TestLoans from './util/TestLoans.js';
import {LoanCreated, LoanTermBegin, LoanBidsRejected, PeriodicRepayment,
          ValueRedeemed} from './util/LoanEvents';
import {generateTestBids} from './util/BidUtils';
import Constants from '../src/Constants.js';
import sinon from 'sinon';

describe('Loan', () => {
  let contract;
  let uuid;
  let loan;

  describe('#constructor()', function() {
    let unsignedLoanData;
    let malformedLoanData;
    let signedLoanData;

    before(() => {
       unsignedLoanData = TestLoans.LoanDataUnsigned(ACCOUNTS);
       malformedLoanData = TestLoans.LoanDataMalformed(ACCOUNTS);
    })

    it('should instantiate w/o throwing w/ valid unsigned loan data', async () => {
      loan = await Loan.create(web3, unsignedLoanData);
    });

    it('should instantiate w/o throwing w/ valid signed loan data', async () => {
      loan = await Loan.create(web3, unsignedLoanData);
      await loan.signAttestation()

      signedLoanData = unsignedLoanData;
      signedLoanData.signature = loan.signature;

      loan = await Loan.create(web3, signedLoanData);
    })

    it('should throw when instantiated with malformed loan data', async () => {
      try {
        await Loan.create(web3, TestLoans.LoanDataMalformed(ACCOUNTS))
        expect().fail('should throw error')
      } catch (err) {
        expect(err.toString()).to.contain("is not a valid");
      }
    })

    it('should throw if included signature is not valid', async () => {
      signedLoanData.defaultRisk = 0.1;
      try {
        await Loan.create(web3, signedLoanData)
        expect().fail('should throw error')
      } catch (err) {
        expect(err.toString()).to.contain("invalid signature!");
      }
    })
  })

  describe('#broadcast()', function() {
    it("should successfuly broadcast a loan creation request", function(done) {
      loan.events.created().then((event) => {
        event.watch(() => {
          event.stopWatching(() => {
            done()
          })
        })
        return loan.broadcast({ from: ACCOUNTS[0] });
      })
    })

    it("should return error when broadcasting a loan request that already exists", async function() {
      try {
        const result = await loan.broadcast()
        expect().fail("should throw error");
      } catch (err) {
        expect(err.toString()).to.contain('conflicting UUID');
      }
    })
  })

  let bids;

  describe('#bid()', async () => {
    before(() => {
      bids = generateTestBids(web3, ACCOUNTS.slice(2, 10), 0.25, 0.5);
    })

    it('should let investors bid on loan request', async () => {
      await Promise.all(bids.map((bid) => {
        return loan.bid(bid.amount, bid.bidder, bid.minInterestRate,
          { from: bid.bidder })
      }))
    });

    it('should throw if token recipient is malformed address', async () => {
      try {
        await loan.bid(bids[0].amount, '0x123', bids[0].minInterestRate,
          { from: bids[0].bidder })
        expect().fail("should throw error");
      } catch (err) {
        expect(err.toString()).to.contain('valid ethereum address.')
      }
    })
  })

  describe('#getBids()', () => {
    before(async () => {
      // Pause to wait for bids to be mined and review period to begin.
      await util.pause(5);
    })

    it('should allow borrower to retrieve bids', async () => {
      let retrievedBids = await loan.getBids();
      for (let i = 0; i < bids.length; i++) {
        const bidReturned = _.some(retrievedBids, (bid) => {
          return bid.amount.equals(bids[i].amount) &&
            bid.minInterestRate.equals(bids[i].minInterestRate) &&
            bid.bidder === bids[i].bidder
        })

        expect(bidReturned).to.be(true);
      }
    })
  })

  describe('#acceptBids()', () => {
    it('should throw if borrower accepts bids that total < principal + fee', async () => {
      try {
        let acceptedBids = bids.slice(0,1).map((bid) => {
          return {
            bidder: bid.bidder,
            amount: web3.toWei(0.2, 'ether'),
          }
        })
        await loan.acceptBids(acceptedBids)
        expect().fail('should throw error')
      } catch (err) {
        expect(err.toString()).to.contain('should equal the desired principal');
      }
    })

    it('should throw if borrower accept sbids that total > principal + fee', async () => {
      try {
        let acceptedBids = bids.slice(0,10).map((bid) => {
          return {
            bidder: bid.bidder,
            amount: web3.toWei(0.2, 'ether'),
          }
        })
        await loan.acceptBids(acceptedBids)
        expect().fail('should throw error')
      } catch (err) {
        expect(err.toString()).to.contain('should equal the desired principal');
      }
    })

    it('should throw if borrower accepts bids that have malformed data', async () => {
      try {
        let acceptedBids = bids.slice(0,5).map((bid) => {
          return {
            bidder: '0x123',
            amount: web3.toWei(0.2002, 'ether'),
          }
        })
        await loan.acceptBids(acceptedBids)
        expect().fail('should throw error')
      } catch (err) {
        expect(err.toString()).to.contain('format is invalid');
      }
    })

    it('should let borrower accept bids that total = principal + fee', async () => {
      let acceptedBids = bids.slice(0,5).map((bid) => {
        return {
          bidder: bid.bidder,
          amount: web3.toWei(0.2002, 'ether'),
        }
      })

      const balanceBefore = web3.eth.getBalance(loan.borrower);
      const result = await loan.acceptBids(acceptedBids)

      // Pause to wait for tx to be mined.
      await util.pause(3);

      const balanceAfter = web3.eth.getBalance(loan.borrower);
      const gasCosts = await util.getGasCosts(result);
      const balanceDelta = balanceAfter.minus(balanceBefore).plus(gasCosts);

      expect(balanceDelta.equals(loan.principal)).to.be(true);
    })
  })

  describe('#rejectBids()', () => {
    describe('Auction State', () => {
      it('should throw if borrower rejects bids during auction', async () => {
        const auctionStateLoan = await TestLoans.LoanInAuctionState(ACCOUNTS);
        try {
          await auctionStateLoan.rejectBids()
          expect().fail('should throw error')
        } catch (err) {
          expect(err.toString()).to.contain('during the review period.');
        }
      })
    })

    describe('Review State', () => {
      it('should let borrower rejects bids during the review period', async () => {
        const reviewStateLoan = await TestLoans.LoanInReviewState(ACCOUNTS);
        await reviewStateLoan.rejectBids();
      })
    })

    describe('Accepted State', () => {
      it('should throw if borrower rejects bids after accepting', async () => {
        const acceptedStateLoan = await TestLoans.LoanInAcceptedState(ACCOUNTS);
        try {
          await acceptedStateLoan.rejectBids()
          expect().fail('should throw error')
        } catch (err) {
          expect(err.toString()).to.contain('during the review period.');
        }
      })
    })

    describe('Rejected State', () => {
      it('should throw if borrower rejects bids after rejecting', async () => {
        const rejectedStateLoan = await TestLoans.LoanInRejectedState(ACCOUNTS);
        try {
          await rejectedStateLoan.rejectBids()
          expect().fail('should throw error')
        } catch (err) {
          expect(err.toString()).to.contain('during the review period.');
        }
      })
    })
  })

  describe('#withdrawInvestment()', () => {
    let withdrawTestLoan;

    describe('auction state', () => {
      before(async () => {
        withdrawTestLoan = await TestLoans.LoanInAuctionState(ACCOUNTS);
        await withdrawTestLoan.bid(
          web3.toWei(0.1, 'ether'),
          ACCOUNTS[2],
          web3.toWei(0.1, 'ether'),
          { from: ACCOUNTS[2] }
        )
      })

      it('should throw when bidder tries to withdraw', async () => {
        try {
          await withdrawTestLoan.withdrawInvestment({ from: ACCOUNTS[2] })
          expect().fail('should throw error')
        } catch (err) {
          expect(err.toString())
            .to.contain('once the loan has been accepted or rejected.');
        }
      })
    })

    describe('review state', () => {
      before(async () => {
        withdrawTestLoan = await TestLoans.LoanInReviewState(ACCOUNTS, {
          reviewPeriodLength: 5
        });
      })

      it('should throw when bidder tries to withdraw and review period has not lapsed', async () => {
        try {
          await withdrawTestLoan.withdrawInvestment({ from: ACCOUNTS[2] })
          expect().fail('should throw error')
        } catch (err) {
          expect(err.toString())
            .to.contain('once the loan has been accepted or rejected.');
        }
      })

      it("should let bidders withdraw the entirety of their bids when review" +
          " period has lapsed w/o borrower action", (done) => {
        withdrawTestLoan.events.reviewPeriodCompleted().then((event) => {
          event.watch(() => {
            event.stopWatching(async () => {
              const balanceBefore = web3.eth.getBalance(ACCOUNTS[2]);
              await withdrawTestLoan.withdrawInvestment({ from: ACCOUNTS[2] })
              const balanceAfter = web3.eth.getBalance(ACCOUNTS[2]);
              expect(balanceAfter).to.be.greaterThan(balanceBefore);
              done();
            })
          })
        })
      })
    })

    describe('accepted state', () => {
      before(async () => {
        withdrawTestLoan = await TestLoans.LoanInAcceptedState(ACCOUNTS);
      })

      it('should let bidder withdraw the remainders of the bid', async () => {
        const balanceBefore = web3.eth.getBalance(ACCOUNTS[2]);
        await withdrawTestLoan.withdrawInvestment({ from: ACCOUNTS[2] })
        const balanceAfter = web3.eth.getBalance(ACCOUNTS[2]);
        expect(balanceAfter).to.be.greaterThan(balanceBefore);
      })
    })

    describe('rejected state', () => {
      before(async () => {
        withdrawTestLoan = await TestLoans.LoanInRejectedState(ACCOUNTS);
      })

      it('should let bidder withdraw the remainders of the bid', async () => {
        const balanceBefore = web3.eth.getBalance(ACCOUNTS[2]);
        await withdrawTestLoan.withdrawInvestment({ from: ACCOUNTS[2] })
        const balanceAfter = web3.eth.getBalance(ACCOUNTS[2]);
        expect(balanceAfter).to.be.greaterThan(balanceBefore);
      })
    })
  })

  describe("#repay()", async function() {
    let loanInReview;

    before(async () => {
      loanInReview = await TestLoans.LoanInReviewState(ACCOUNTS);
    })

    it("should not let a user make a repayment before the loan term begins", async function() {
      try {
        await loanInReview.repay(web3.toWei(0.1, 'ether'), { from: ACCOUNTS[0] });
        expect().fail("should throw error");
      } catch (err) {
        expect(err.toString()).to.contain('until loan term has begun.');
      }
    })

    it("should let a user make a repayment once the loan term begins", async function() {
      await loan.repay(web3.toWei(0.1, 'ether'), { from: ACCOUNTS[0] });
      const amountRepaid = await loan.amountRepaid()
      expect(amountRepaid.equals(web3.toWei(0.1, 'ether'))).to.be(true);
    });
  })

  describe("#redeemValue()", function() {
    it("should not allow an investor to redeem value before loan term begins", async function() {
      const loanInReview = await TestLoans.LoanInReviewState(ACCOUNTS);
      try {
        const result = await loanInReview.redeemValue(ACCOUNTS[2], { from: ACCOUNTS[2] });
        expect().fail("should throw error");
      } catch (err) {
        expect(err.toString()).to.contain("until the loan term has begun.");
      }
    })

    it("should allow an investor to redeem repaid value after the loan term begins", async function() {
      const redeemableValue = await loan.getRedeemableValue(ACCOUNTS[2]);

      const balanceBefore = web3.eth.getBalance(ACCOUNTS[2])
      const result = await loan.redeemValue(ACCOUNTS[2],
        { from: ACCOUNTS[2] });
      const balanceAfter = web3.eth.getBalance(ACCOUNTS[2]);
      const gasCosts = await util.getGasCosts(result.tx);
      expect(balanceAfter
              .minus(balanceBefore)
              .plus(gasCosts)
              .equals(redeemableValue))
              .to.be(true);
    });

    it("should not allow a non-investor to redeem repaid value", async function() {
      try {
        await loan.redeemValue(ACCOUNTS[2], { from: ACCOUNTS[14] });
        expect().fail("should throw error");
      } catch (err) {
        expect(err.toString()).to.contain("Value cannot be redeemed by non-investors.")
      }
    })
  });

  describe('#events', function() {
    let loanOfInterest;

    before(async function() {
      loanOfInterest = await Loan.create(web3, TestLoans.LoanDataUnsigned(ACCOUNTS, {
        auctionPeriodLength: 3,
        reviewPeriodLength: 3
      }));
      await loanOfInterest.signAttestation();
    });

    it("should callback on LoanCreated event", async function() {
      const blockNumber = await util.getLatestBlockNumber(web3);
      const loanCreatedEvent = await loanOfInterest.events.created();
      loanCreatedEvent.watch(function(err, result) {
        util.assertEventEquality(result, LoanCreated({
          uuid: loanOfInterest.uuid,
          borrower: loanOfInterest.borrower,
          attestor: loanOfInterest.attestor,
          blockNumber: blockNumber + 1
        }))
        loanCreatedEvent.stopWatching();
      })

      await loanOfInterest.broadcast();
    })

    it('should callback on AuctionCompleted event', async () => {
      let callback = sinon.spy();

      const auctionCompletedEvent =
        await loanOfInterest.events.auctionCompleted();
      auctionCompletedEvent.watch(callback)

      // Pause while waiting for review period to complete
      await util.pause(5)

      expect(callback.called).to.be(true);
    })

    it('should callback on ReveiwPeriodCompleted event', async () => {
      let callback = sinon.spy();

      const reviewPeriodCompletedEvent =
        await loanOfInterest.events.reviewPeriodCompleted();
      reviewPeriodCompletedEvent.watch(callback)

      // Pause while waiting for review period to complete
      await util.pause(5)

      expect(callback.called).to.be(true);
    })

    it("should callback on LoanTermBegin event", async function() {
      const loan = await TestLoans.LoanInReviewState(ACCOUNTS);

      const blockNumber = await util.getLatestBlockNumber(web3);
      const termBeginEvent = await loan.events.termBegin();
      termBeginEvent.watch(function(err, result) {
        util.assertEventEquality(result, LoanTermBegin({
          uuid: loan.uuid,
          borrower: loan.borrower,
          blockNumber: blockNumber + 1
        }))
        termBeginEvent.stopWatching();
      })

      await loan.acceptBids(ACCOUNTS.slice(2,7).map((account) => {
        return {
          bidder: account,
          amount: web3.toWei(0.2002, 'ether')
        }
      }))
    })

    it("should callback on LoanBidsRejected event", async function() {
      const loan = await TestLoans.LoanInReviewState(ACCOUNTS);

      const blockNumber = await util.getLatestBlockNumber(web3);
      const bidsRejectedEvent = await loan.events.bidsRejected();
      bidsRejectedEvent.watch(function(err, result) {
        util.assertEventEquality(result, LoanBidsRejected({
          uuid: loan.uuid,
          borrower: loan.borrower,
          blockNumber: blockNumber + 1
        }))
        bidsRejectedEvent.stopWatching();
      })

      await loan.rejectBids();
    })

    it("should callback on PeriodicRepayment event", async function() {
      const loan = await TestLoans.LoanInAcceptedState(ACCOUNTS);

      const repaymentAmount = web3.toWei(0.2, 'ether');
      const blockNumber = await util.getLatestBlockNumber(web3);
      const repaymentEvent = await loan.events.repayment();
      repaymentEvent.watch(function(err, result) {
        util.assertEventEquality(result, PeriodicRepayment({
          uuid: loan.uuid,
          from: loan.borrower,
          value: repaymentAmount,
          blockNumber: blockNumber + 1
        }))
        repaymentEvent.stopWatching();
      })

      await loan.repay(repaymentAmount);
    })

    it("should callback on ValueRedeemed event", async function() {
      const loan = await TestLoans.LoanInAcceptedState(ACCOUNTS);
      await loan.repay(web3.toWei(0.3, 'ether'));

      const redeemableValue = await loan.getRedeemableValue(ACCOUNTS[2]);

      const blockNumber = await util.getLatestBlockNumber(web3);
      const valueRedeemedEvent = await loanOfInterest.events.valueRedeemed();
      valueRedeemedEvent.watch(function(err, result) {
        util.assertEventEquality(result, ValueRedeemed({
          uuid: loan.uuid,
          investor: ACCOUNTS[2],
          recipient: ACCOUNTS[2],
          value: redeemableValue,
          blockNumber: blockNumber + 1
        }))
        valueRedeemedEvent.stopWatching();
      });

      await loan.redeemValue(ACCOUNTS[2], { from: ACCOUNTS[2] })
    })
  })
})
