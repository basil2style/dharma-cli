import uuidV4 from 'uuid/v4';
import Dharma from 'dharma-js';
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import Random from 'random-js';
import Borrower from '../../src/Borrower';

class LoanUtils {
  constructor(web3) {
    this.web3 = web3;
    this.dharma = new Dharma(web3);
  }

  async generateSignedLoan(options={}) {
    let loanData = {
      uuid: this.web3.sha3(uuidV4()),
      borrower: ACCOUNTS[0],
      attestor: ACCOUNTS[1],
      principal: this.web3.toWei(1, 'ether'),
      terms: {
        version: 1,
        periodType: 'daily',
        periodLength: 1,
        termLength: 3,
        compounded: true
      },
      attestorFee: this.web3.toWei(0.001, 'ether'),
      defaultRisk: this.web3.toWei(0.323, 'ether'),
      auctionPeriodLength: 5,
      reviewPeriodLength: 10
    }

    for (let key in options) {
      loanData[key] = options[key];
    }

    const loan = await this.dharma.loans.create(loanData);
    await loan.signAttestation();
    return loan;
  }

  async simulateAuction(borrower, loan, deployedCallback, reviewCallback, done, successful=true) {
    const _this = this;
    return new Promise(function (resolve) {
      borrower.broadcastLoanRequest(loan, function(err, result) {
        deployedCallback(err, result);
        let bidSet
        if (successful) {
          bidSet = _this.generateTestBids(ACCOUNTS.slice(2,12),
            loan.principal.plus(loan.attestorFee), 0.25, 0.3);
        } else {
          bidSet = _this.generateTestBids(ACCOUNTS.slice(2,3),
            loan.principal.plus(loan.attestorFee), 0.25, 0.3);
        }

        const bids = bidSet.bids;
        const expectedWinningBids = bidSet.winningBids;
        const expectedInterestRate = bidSet.bestInterestRate;

        Promise.all(bids.map((bid) => {
          return loan.bid(bid.amount, bid.bidder,
            _this.web3.toWei(bid.minInterestRate, 'ether'))
        }));


        resolve({
          bids: bids,
          expectedWinningBids: expectedWinningBids,
          expectedInterestRate: expectedInterestRate
        })
      }, async function(err, result) {
        await reviewCallback(err, result);
        done();
      });
    });
  }

  async simulateFailedAuction(borrower, loan, deployedCallback, reviewCallback, done) {
    await this.simulateAuction(borrower, loan, deployedCallback, reviewCallback, done, false);
  }

  async generatePortfolioInvestment(address, options={}) {
    const _this = this;
    const borrower = new Borrower(this.dharma);
    return new Promise(async function(resolve, reject) {
      const loanData = await _this.generateSignedLoanData(options);
      const loan = await _this.dharma.loans.create(loanData);

      const deployedCallback = (err, result) => {
      };
      const reviewCallback = async (err, bestBids) => {
        const bid = {
          bidder: address,
          amount: loan.attestorFee.plus(loan.principal)
        }
        await loan.acceptBids([bid]);
      }

      const termBeginEvent = await loan.events.termBegin();
      termBeginEvent.watch(() => {
        termBeginEvent.stopWatching(() => {
          resolve(loan);
        })
      })

      borrower.broadcastLoanRequest(loan, deployedCallback, reviewCallback);
    });
  }

  static v1TermsDefault(options={}) {
    let terms = {
      version: 1,
      periodType: 'weekly',
      periodLength: 1,
      termLength: 1,
      compounded: false
    }

    for (let key in options) {
      terms[key] = options[key];
    }

    return terms;
  }

  generateTestBids(bidders, totalNeeded, minAmount, maxAmount, minInterest=0.1, maxInterest=1.0) {
    let bids = []
    let winningBids = []
    const interestRates = _.range(minInterest, maxInterest, (maxInterest-minInterest) / bidders.length);
    const amounts = _.range(minAmount, maxAmount, (maxAmount-minAmount) / bidders.length);
    let bestInterestRate = new BigNumber(0);
    let totalRaised = new BigNumber(0);

    for (let i = 0; i < bidders.length; i++) {
      const bid = {
        bidder: bidders[i],
        amount: this.web3.toWei(amounts[i]),
        minInterestRate: interestRates[i]
      }

      bids.push(bid)

      let remainingBalance = BigNumber.max(totalNeeded.minus(totalRaised), 0);
      if (remainingBalance > 0) {
        const amountTaken = BigNumber.min(bid.amount, remainingBalance);
        const bidTaken = {
          bidder: bid.bidder,
          amount: amountTaken,
        }

        winningBids.push(bidTaken)
        bestInterestRate = interestRates[i];
        totalRaised = totalRaised.plus(BigNumber.min(bid.amount, remainingBalance))
      }
    }

    return {
      bids: bids,
      winningBids: winningBids,
      bestInterestRate: bestInterestRate
    }
  }
}

module.exports = LoanUtils;
