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
import mock from 'mock-fs';
import { REPAYMENT_STATUS } from '../../src/Constants';
import moment from 'moment';

const util = new Util(web3);
const loanUtils = new LoanUtils(web3);
const dharma = new Dharma(web3);
const borrower = new Borrower(dharma);

const walletStub = {
  getAddress: () => {
    return ACCOUNTS[13];
  }
}

const storeStub = {
  dispatch: () => {}
}

describe("Investor", () => {
  let investor;
  let errorCallback = sinon.spy();
  let investmentUuids = [];

  it("should load the decision engine from a file w/o throwing", async () => {
    const path = 'test/utils/DecisionEngine.js';
    investor = await Investor.fromPath(dharma, walletStub, path);
  })

  it('should throw on loading decision engine from non-existent file', async () => {
    try {
      const path = 'test/utils/nonExistent.js';
      investor = await Investor.fromPath(dharma, walletStub, path);
      expect().fail("should throw error");
    } catch (err) {
      expect(err.toString()).to.contain("Decision engine file not found.");
    }
  })

  it('should load the decision engine from memory w/o throwing', () => {
    investor = new Investor(dharma, walletStub, DecisionEngine);
  })

  describe("startDaemon()", () => {
    before(async () => {
      mock();
      await investor.startDaemon(storeStub, errorCallback);
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

          return loanUtils.simulateAuction(borrower, loan, onLoanBroadcasted, onLoanReview, done);
        });
      })

      it('should withdraw the remainder of the bid that is not accepted', (done) => {
        let balanceBefore;
        let acceptedBids = [{ bidder: ACCOUNTS[13], amount: web3.toWei(0.501, 'ether') }];
        util.getBalance(ACCOUNTS[13]).then((balance) => {
          balanceBefore = balance;
          return loan.getBids()
        }).then((bids) => {
          bids.some((bid) => {
            if (bid.bidder != ACCOUNTS[13]) {
              acceptedBids.push({
                bidder: bid.bidder,
                amount: web3.toWei(0.1, 'ether')
              })
            }

            return acceptedBids.length == 6;
          })

          return loan.acceptBids(acceptedBids);
        }).then(() => {
          investmentUuids.push(loan.uuid);

          setTimeout(() => {
            util.getBalance(ACCOUNTS[13]).then((balanceAfter) => {
              expect(balanceAfter.gt(balanceBefore)).to.be(true);
              done();
            }).catch((err) => {
              done(err)
            });
          }, 6000)
        }).catch((err) => {
          done(err);
        })
      })

      it('should withdraw the entire balance if investor lost auction', (done) => {
        let acceptedBids = ACCOUNTS.slice(2,7).map((account) => {
          return {
            amount: web3.toWei(0.2002, 'ether'),
            bidder: account
          }
        })

        let balanceBefore;
        util.getBalance(ACCOUNTS[13]).then((balance) => {
          balanceBefore = balance;
          return loan.acceptBids(acceptedBids);
        }).then(() => {
          setTimeout(() => {
            util.getBalance(ACCOUNTS[13]).then((balanceAfter) => {
              expect(balanceAfter.gt(balanceBefore)).to.be(true);
              done();
            }).catch((err) => {
              done(err);
            });
          }, 6000)
        });
      })

      it('should withdraw the entire balance if bids are rejected', (done) => {
        let balanceBefore;
        util.getBalance(ACCOUNTS[13]).then((balance) => {
          balanceBefore = balance;
          return loan.rejectBids();
        }).then(() => {
          setTimeout(() => {
            util.getBalance(ACCOUNTS[13]).then((balanceAfter) => {
              expect(balanceAfter.gt(balanceBefore)).to.be(true);
              done();
            }).catch((err) => {
              done(err);
            });
          }, 6000)
        });
      })

      it('should withdraw the entire balance if bids are ignored', (done) => {
        util.getBalance(ACCOUNTS[13]).then((balanceBefore) => {
          setTimeout(() => {
              util.getBalance(ACCOUNTS[13]).then((balanceAfter) => {
                expect(balanceAfter.gt(balanceBefore)).to.be(true);
                done();
              }).catch((err) => {
                done(err);
              });
          }, 15000)
        });
      })

      describe('bids accepted', () => {
        beforeEach(async () => {
          let bestBidSet = await borrower.getBestBidSet(loan);
          await loan.acceptBids(bestBidSet.bids)
        })

        it('should update amountRepaid if borrower repays', async () => {
            await util.pause(5);
            const result = await loan.repay(web3.toWei(0.55, 'ether'))
            await util.pause(5);
            const investment = investor.portfolio.getInvestment(loan.uuid);
            expect(investment.amountRepaid.equals(web3.toWei(0.55, 'ether'))).to.be(true);
        })

        it("it should send whatever redeemable value there is to the user", (done) => {
          dharma.loans.events.valueRedeemed({ uuid: loan.uuid }).then((valueRedeemedEvent) => {
            valueRedeemedEvent.watch(async (err, result) => {
              done();
            })
            return dharma.loans.events.repayment({ uuid: loan.uuid });
          }).then((repaymentEvent) => {
            return repaymentEvent.watch(async (err, result) => {
              await investor.collect(loan.uuid);
            })
          }).then(() => {
            return dharma.loans.events.termBegin({ uuid: loan.uuid });
          }).then((termBeginEvent) => {
            return loan.repay(web3.toWei(1, 'ether'));
          })
        })
      })
    })
  })

  describe("stopDaemon()", () => {
    before(async () => {
      await investor.stopDaemon();
    })

    after(mock.restore);

    describe("desirableLoan", () => {
      let loan;

      before(async () => {
        const loanData = await loanUtils.generateSignedLoanData({
          principal: web3.toWei(4, 'ether'),
          defaultRisk: web3.toWei(0.85, 'ether')
        });

        loan = await dharma.loans.create(loanData);

        loan.bid = sinon.spy();

      })

      it("should not invest in the loan", (done) => {
        const onLoanBroadcasted = () => { /* do nothing */ }
        const onLoanReview = () => {
          try {
            expect(loan.bid.called).to.be(false);
            done()
          } catch (err) {
            done(err)
          }
        }

        borrower.broadcastLoanRequest(loan, onLoanBroadcasted, onLoanReview)
      })
    });
  })

})
