import os from 'os';
import LoanUtils from '../utils/LoanUtils';
import {web3} from '../init';
import Dharma from 'dharma';
import Borrower from '../../src/Borrower';
import DecisionEngine from '../utils/decisionEngine';
import sinon from 'sinon';
import Investor from '../../src/Investor';
import expect from 'expect.js';
import _ from 'lodash';
import Util from '../utils/util';

const util = new Util(web3);
const loanUtils = new LoanUtils(web3);
const decisionEngine = new DecisionEngine();
const dharma = new Dharma(web3);
const borrower = new Borrower(dharma);

describe("Investor", () => {
  let investor;

  it("should load the decision engine from a file w/o throwing", async () => {
    const path = __dirname + '/../utils/DecisionEngine.js';
    investor = await Investor.fromPath(dharma, path);
  })

  it('should throw on loading decision engine from non-existent file', async () => {
    try {
      const path = __dirname + '/../utils/nonExistent.js';
      investor = await Investor.fromPath(dharma, path);
      expect().fail("should throw error");
    } catch (err) {
      expect(err.toString()).to.contain("Decision engine file not found.");
    }
  })

  it('should load the decision engine from memory w/o throwing', () => {
    investor = new Investor(dharma, decisionEngine);
  })

  describe("startDaemon()", () => {
    before(async () => {
      await investor.startDaemon();
    })

    describe('undesirableLoan', () => {
      let loan;

      before(async () => {
        const loanData = await loanUtils.generateSignedLoanData({
          principal: web3.toWei(4, 'ether'),
          defaultRisk: web3.toWei(0.85, 'ether')
        });

        loan = await dharma.loans.create(loanData);

        investor.decisionEngine.decide = sinon.stub().returns(false);

        loan.bid = sinon.spy();
      })

      it("should not invest in the loan", (done) => {
        const onLoanBroadcasted = () => { /* do nothing */ }
        const onLoanReview = () => {
          try {
            expect(investor.decisionEngine.decide.calledOnce).to.be(true);
            expect(investor.decisionEngine.decide.args[0][0].uuid).to.be(loan.uuid);

            expect(loan.bid.called).to.be(false);
            done()
          } catch (err) {
            done(err)
          }
        }

        borrower.broadcastLoanRequest(loan, onLoanBroadcasted, onLoanReview)
      })
    })

    describe('desirableLoan', () => {
      let loan;
      let amount;
      let minInterestRate;

      beforeEach((done) => {
        loanUtils.generateSignedLoanData({
          principal: web3.toWei(1, 'ether'),
          defaultRisk: web3.toWei(0.25, 'ether')
        }).then((loanData) => {
          return dharma.loans.create(loanData);
        }).then((loanObject) => {
          loan = loanObject;
          amount = web3.toWei(1, 'ether');
          minInterestRate = web3.toWei(0.1, 'ether');

          investor.decisionEngine.decide = sinon.stub().returns({
            bidder: ACCOUNTS[13],
            amount: amount,
            minInterestRate: minInterestRate
          });

          const onLoanBroadcasted = () => { /* do nothing */}
          const onLoanReview = async () => {
            try {
              expect(investor.decisionEngine.decide.calledOnce).to.be(true);
              expect(investor.decisionEngine.decide.args[0][0].uuid).to.be(loan.uuid);

              const bids = await loan.getBids();

              const investorBid =
                _.find(bids, (bid) => { return bid.bidder == ACCOUNTS[13] });

              expect(investorBid.amount.equals(amount)).to.be(true);
              expect(investorBid.bidder).to.be(ACCOUNTS[13]);
              expect(investorBid.minInterestRate.equals(minInterestRate)).to.be(true);
            } catch (err) {
              done(err)
            }
          }
          let x = loanUtils.simulateAuction(borrower, loan, onLoanBroadcasted, onLoanReview, done)
          return
        }).catch((err) => {
        });
      })

      it('should withdraw the remainder of the bid that is not accepted', (done) => {
        const balanceBefore = web3.eth.getBalance(ACCOUNTS[13]);
        let acceptedBids = [{ bidder: ACCOUNTS[13], amount: web3.toWei(0.501, 'ether') }];
        loan.getBids().then((bids) => {
          bids.some((bid) => {
            if (bid.bidder != ACCOUNTS[13]) {
              acceptedBids.push({
                bidder: bid.bidder,
                amount: web3.toWei(0.1, 'ether')
              })
            }

            return acceptedBids.length == 6;
          })

          loan.acceptBids(acceptedBids).then(() => {
            setTimeout(() => {
              try {
                const balanceAfter = web3.eth.getBalance(ACCOUNTS[13]);
                expect(balanceAfter.gt(balanceBefore)).to.be(true);
                done();
              } catch (err) {
                done(err)
              }
            }, 6000)
          }).catch((err) => {
            done(err);
          })
        })
      })

      it('should withdraw the entire balance if investor lost auction', (done) => {
        let acceptedBids = ACCOUNTS.slice(2,7).map((account) => {
          return {
            amount: web3.toWei(0.2002, 'ether'),
            bidder: account
          }
        })

        const balanceBefore = web3.eth.getBalance(ACCOUNTS[13]);

        loan.acceptBids(acceptedBids).then(() => {
          setTimeout(() => {
            try {
              const balanceAfter = web3.eth.getBalance(ACCOUNTS[13]);
              expect(balanceAfter.gt(balanceBefore)).to.be(true);
              done();
            } catch (err) {
              done(err)
            }
          }, 6000)
        });
      })

      it('should withdraw the entire balance if bids are rejected', (done) => {
        const balanceBefore = web3.eth.getBalance(ACCOUNTS[13]);

        loan.rejectBids().then(() => {
          setTimeout(() => {
            try {
              const balanceAfter = web3.eth.getBalance(ACCOUNTS[13]);
              expect(balanceAfter.gt(balanceBefore)).to.be(true);
              done();
            } catch (err) {
              done(err)
            }
          }, 6000)
        });
      })

      it('should withdraw the entire balance if bids are ignored', (done) => {
        const balanceBefore = web3.eth.getBalance(ACCOUNTS[13]);

        setTimeout(() => {
          try {
            const balanceAfter = web3.eth.getBalance(ACCOUNTS[13]);
            expect(balanceAfter.gt(balanceBefore)).to.be(true);
            done();
          } catch (err) {
            done(err)
          }
        }, 6000)
      })
    })
  })

  describe("stopDaemon()", () => {
    // describe("desirableLoan");
  })

  describe("getPortfolio()", () => {
    it('should return portfolio with correct data')
  })

  describe("collect(uuid)", () => {
    // describe("it should send whatever redeemable value there is to the user")
  })
})
