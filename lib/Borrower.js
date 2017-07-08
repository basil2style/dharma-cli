import Authenticate from './Authenticate';
import {AuthenticationError, RejectionError} from './Errors';
import request from 'request-promise';
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import Util from './Util';

const RAA_ROOT = 'https://risk.dharma.io'

class Borrower {
  constructor(dharma, raaRoot=RAA_ROOT) {
    this.dharma = dharma;
    this.auth = new Authenticate();
    this.raaUri = raaRoot;
  }

  async requestAttestation(borrower, amount) {
    const authKey = await this.auth.getAuthKey();

    const params =
      this._getRequestParams('/requestLoan', { authKey: authKey });
    const response = await request(params);
    if ('error' in response) {
      switch (response.error) {
        case 'INVALID_AUTH_TOKEN':
          throw new AuthenticationError('Invalid Authentication Token')
        case 'LOAN_REQUEST_REJECTED':
          throw new RejectionError('Your loan request has been rejected.')
        default:
          throw new Error(response.error);
      }
    }

    const loan = await this.dharma.loans.create(response);
    await loan.verifyAttestation();

    return loan;
  }

  async broadcastLoanRequest(loan, deployedCallback, reviewCallback) {
    const _this = this;
    const createdEvent = await loan.events.created()
    createdEvent.watch((err, result) => {
      createdEvent.stopWatching(() => {
        deployedCallback(err, result);

        if (err)
          return;

        loan.events.auctionCompleted().then((auctionCompletedEvent) => {
          auctionCompletedEvent.watch((err, result) => {
            auctionCompletedEvent.stopWatching(() => {
              if (err) {
                reviewCallback(err, null);
              } else {
                _this.getBestBidSet(loan).then(function(result) {
                  if ('error' in result)
                    reviewCallback(result, null);
                  else
                    reviewCallback(null, result);
                });
              }
            });
          })
        })
      })
    });

    await loan.broadcast();
  }

  async acceptLoanTerms(loan, bids, callback) {
    const termBeginEvent = await loan.events.termBegin();

    termBeginEvent.watch((err, result) => {
      termBeginEvent.stopWatching(() => {
        if (err) callback(err, null);
        else {
          const blockNumber = result.args.blockNumber;
          callback(null, result.args.blockNumber);
        }
      })
    })

    await loan.acceptBids(bids);
  }

  async getBestBidSet(loan) {
    const bids = await loan.getBids()

    const sortedBids = _.sortBy(bids, ['minInterestRate']);
    const totalNeeded = loan.principal.plus(loan.attestorFee);
    let totalRaised = new BigNumber(0);
    let bestInterestRate = new BigNumber(0);
    let bestBids = [];

    sortedBids.some((bid) => {
      const remainingBalance = totalNeeded.minus(totalRaised);
      const amountTaken = BigNumber.min(remainingBalance, bid.amount);
      totalRaised = totalRaised.plus(amountTaken);
      bestInterestRate = bid.minInterestRate;

      const bidTaken = {
        bidder: bid.bidder,
        amount: amountTaken
      }
      bestBids.push(bidTaken);

      return totalRaised.equals(totalNeeded)
    })

    if (totalRaised.lt(totalNeeded)) {
      return {
        error: 'PRINCIPAL_UNMET'
      }
    } else {
      return {
        bids: bestBids,
        interestRate: bestInterestRate
      }
    }
  }

  _getRequestParams(endpoint, queries={}) {
    return {
      uri: this.raaUri + endpoint,
      qs: queries,
      headers: {
          'User-Agent': 'Request-Promise'
      },
      json: true
    };
  }
}

module.exports = Borrower;
