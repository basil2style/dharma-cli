import {web3, util} from './init.js';
import Loan from '../src/Loan.js';
import Metadata from '../package.json';
import expect from 'expect.js';
import uuidV4 from 'uuid/v4';
import TestLoans from './util/TestLoans';
import {Transfer, Approval} from './util/LoanEvents';

describe('ERC20', function() {
  let loan;

  before(async function() {
    loan = await TestLoans.LoanInAcceptedState(ACCOUNTS);
  })

  describe('#transfer()', function() {
    it("should allow an investor to transfer their balance to someone else", async function() {
      const amount = web3.toWei(0.1, 'ether');

      const fromBalanceBefore = await loan.balanceOf(ACCOUNTS[2]);
      await loan.transfer(ACCOUNTS[7], amount, { from: ACCOUNTS[2] });
      const toBalance = await loan.balanceOf(ACCOUNTS[7]);
      expect(toBalance.equals(amount)).to.be(true);
      const fromBalance = await loan.balanceOf(ACCOUNTS[2]);
      expect(fromBalance.equals(fromBalanceBefore.minus(amount))).to.be(true);
    })

    it("should prevent a non-inveestor from transfering anyone's balance", async function() {
      try {
        await loan.transfer(400, ACCOUNTS[4], { from: ACCOUNTS[4] })
        expect().fail("should throw error");
      } catch (err) {
        expect(err.toString()).to.contain("account balance is not high enough")
      }
    })
  })

  describe('#approve()', function() {
    it('should allow the owner of a balance to approve usage by another party', async function() {
      await loan.approve(ACCOUNTS[4], 200, { from: ACCOUNTS[2] });
      const allowance = await loan.allowance(ACCOUNTS[2], ACCOUNTS[4]);
      expect(allowance.equals(200)).to.be(true);
    })
  })

  describe('#transferFrom()', function() {
    it("should allow someone with an approved balance to transfer on an owner's behalf", async function() {
      const balanceBefore = await loan.balanceOf(ACCOUNTS[5]);
      await loan.transferFrom(ACCOUNTS[2], ACCOUNTS[5], 100, { from: ACCOUNTS[4] });
      const balanceAfter =  await loan.balanceOf(ACCOUNTS[5]);
      expect(balanceAfter.minus(balanceBefore).equals(100)).to.be(true);
    })

    it("should not allow someone with an unapproved balance to transfer on an owner's behalf", async function() {
      try {
        await loan.transferFrom(ACCOUNTS[2], ACCOUNTS[5], 100, { from: ACCOUNTS[5] });
        expect().fail("should throw error");
      } catch (err) {
        expect(err.toString()).to.contain("is not high enough to transfer");
      }
    })
  })

  describe('#events', function() {
    it('should callback on Transfer event', async () => {
      const amount = web3.toWei(0.03, 'ether');

      const blockNumber = await util.getLatestBlockNumber(web3);
      const transferEvent = await loan.events.transfer();
      transferEvent.watch(function(err, result) {
        util.assertEventEquality(result, Transfer({
          uuid: loan.uuid,
          from: ACCOUNTS[3],
          to: ACCOUNTS[5],
          value: amount,
          blockNumber: blockNumber + 1
        }))
        transferEvent.stopWatching();
      })

      await loan.transfer(ACCOUNTS[5], amount, { from: ACCOUNTS[3] });
    })

    it('should callback on Approval event', async function() {
      const amount = web3.toWei(0.03, 'ether');

      const blockNumber = await util.getLatestBlockNumber(web3);
      const approvalEvent = await loan.events.approval();
      approvalEvent.watch(function(err, result) {
        util.assertEventEquality(result, Approval({
          uuid: loan.uuid,
          owner: ACCOUNTS[5],
          spender: ACCOUNTS[3],
          value: amount,
          blockNumber: blockNumber + 1
        }))
        approvalEvent.stopWatching();
      })

      await loan.approve(ACCOUNTS[3], amount, { from: ACCOUNTS[5] });
    });
  })
})
