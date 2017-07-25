import Loans from '../lib/loans';
import {web3, util} from './init.js';
import expect from 'expect.js';
import TestLoans from './util/TestLoans';
import {LoanCreated, LoanTermBegin, LoanBidsRejected, PeriodicRepayment,
          ValueRedeemed} from './util/LoanEvents';
import {LoanInAuctionState} from './util/TestLoans';

describe('Loans', function() {
  let loans;
  let loan;

  before(() => {
    loans = new Loans(web3);
  })

  describe('#create()', function() {
    let unsignedLoanData;
    let signedLoanData;
    let malformedLoanData;

    before(() => {
      unsignedLoanData = TestLoans.LoanDataUnsigned(ACCOUNTS);
      malformedLoanData = TestLoans.LoanDataMalformed(ACCOUNTS);
    })

    it('should instantiate w/o throwing w/ valid unsigned loan data', async () => {
      loan = await loans.create(unsignedLoanData);
    });

    it('should instantiate w/o throwing w/ valid signed loan data', async () => {
      loan = await loans.create(unsignedLoanData);
      await loan.signAttestation()

      signedLoanData = unsignedLoanData;
      signedLoanData.signature = loan.signature;
      loan = await loans.create(signedLoanData);
    })

    it('should throw when instantiated with malformed loan data', async () => {
      try {
        await loans.create(TestLoans.LoanDataMalformed(ACCOUNTS))
        expect().fail('should throw error')
      } catch (err) {
        expect(err.toString()).to.contain("is not a valid");
      }
    })

    it('should throw if included signature is not valid', async () => {
      signedLoanData.defaultRisk = 0.1;
      try {
        await loans.create(signedLoanData)
        expect().fail('should throw error')
      } catch (err) {
        expect(err.toString()).to.contain("invalid signature!");
      }
    })
  })

  describe('#get(uuid)', () => {
    let loan;

    before(async () => {
      loan = await LoanInAuctionState(ACCOUNTS);
    })

    it("should retrieve loan with correct data", async () => {
      const retrievedLoan = await loans.get(loan.uuid);
      expect(retrievedLoan.equals(loan));
    })
  })

  describe('#events', function() {
    let loan;

    before(async () => {
      loan = await loans.create(TestLoans.LoanDataUnsigned(ACCOUNTS));
    })

    it("should callback on LoanCreated event", async function() {
      const blockNumber = await util.getLatestBlockNumber(web3);
      const loanCreatedEvent = await loans.events.created({ uuid: loan.uuid });
      loanCreatedEvent.watch(function(err, result) {
        util.assertEventEquality(result, LoanCreated({
          uuid: loan.uuid,
          borrower: loan.borrower,
          attestor: loan.attestor,
          blockNumber: blockNumber + 1
        }))
        loanCreatedEvent.stopWatching();
      })

      await loan.signAttestation();
      await loan.broadcast();
    })

    it("should callback on LoanTermBegin event", async function() {
      const loan = await TestLoans.LoanInReviewState(ACCOUNTS);

      const blockNumber = await util.getLatestBlockNumber(web3);
      const termBeginEvent = await loans.events.termBegin({ uuid: loan.uuid });
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
      const bidsRejectedEvent = await loans.events.bidsRejected({ uuid: loan.uuid });
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
      const repaymentEvent = await loans.events.repayment({ from: loan.borrower });
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
      const valueRedeemedEvent = await loans.events.valueRedeemed({ investor: ACCOUNTS[2] });
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
