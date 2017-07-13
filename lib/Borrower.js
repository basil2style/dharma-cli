import Authenticate from './Authenticate';
import {AuthenticationError, RejectionError} from './Errors';
import request from 'request-promise';
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import Util from './Util';
import Config from './Config';

const MIN_GAS_REQUIRED = 500000;
const GAS_PRICE_IN_GWEI = 22;

class Borrower {
  constructor(dharma) {
    this.dharma = dharma;
    this.web3 = dharma.web3;
    this.auth = new Authenticate();
    this.raaUri = Config.RAA_API_ROOT;
  }

  async requestAttestation(borrowerAddress, amount) {
    const authenticate = new Authenticate();
    const authKey = await authenticate.getAuthKey();

    const params = this._getRequestParams('/requestLoan', {
      authKey: authKey,
      address: borrowerAddress
    });

    let response;
    try {
      response = await request(params);
    } catch (err) {
      if (err.name === 'StatusCodeError') {
        switch (err.response.body.error) {
          case 'INVALID_AUTH_TOKEN':
            throw new AuthenticationError('Invalid Authentication Token')
            break;
          case 'INVALID_ADDRESS':
            throw new Error("Borrower address is invalid.");
            break;
          case 'LOAN_REQUEST_REJECTED':
            throw new RejectionError('Your loan request has been rejected.')
            break;

          default:
            throw new Error(response.error);
        }
      } else {
        throw err;
      }
    }

    const loan = await this.dharma.loans.create(response);
    await loan.verifyAttestation();

    return loan;
  }

  async requestDeploymentStipend(address) {
    const authenticate = new Authenticate();
    const authKey = await authenticate.getAuthKey();

    const params = this._getRequestParams('/requestDeploymentStipend', {
      authKey: authKey,
      address: address
    });

    const response = await request(params);

    if ('error' in response) {
      switch (response.error) {
        case 'INVALID_AUTH_TOKEN':
          throw new AuthenticationError('Invalid Authentication Token')
          break;
        case 'INVALID_ADDRESS':
          throw new Error("Borrower address is invalid.");
          break;
        case 'STIPEND_REQUEST_REJECTED':
          throw new RejectionError('Your deployment stipdend request has been rejected.')
          break;

        default:
          throw new Error(response.error);
      }
    }

    return response.txHash;
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

    await loan.broadcast({ from: loan.borrower });
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

  async acceptBids(loan, bids) {
    const decorator = new LoanDecorator(loan);

    return new Promise(async function(resolve, reject) {
      await loan.acceptBids(bids);
      const termBeginEvent = await loan.events.termBegin();
      termBeginEvent.watch(() => {
        termBeginEvent.stopWatching(() => {
          resolve();
        })
      })
    });
  }

  async rejectBids(loan) {
    const decorator = new LoanDecorator(loan);

    return new Promise(async function(resolve, reject) {
      await loan.rejectBids();
      const bidsRejectedEvent = await loan.events.bidsRejected();
      bidsRejectedEvent.watch(() => {
        bidsRejectedEvent.stopWatching(() => {
          resolve();
        })
      })
    });
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

  async hasMinBalanceRequired(address) {
    return new Promise(function(resolve, reject) {
      this.web3.eth.getBalance(address, function (err, balance) {
        if (err) {
          reject(err);
        } else {
          if (balance.lt(this.web3.toWei(MIN_GAS_REQUIRED*GAS_PRICE_IN_GWEI, 'gwei'))) {
            resolve(false);
          } else {
            resolve(true);
          }
        }
      }.bind(this))
    }.bind(this));
  }

  _getRequestParams(endpoint, params) {
    return {
      method: 'POST',
      uri: this.raaUri + endpoint,
      body: params,
      json: true
    };
  }
}

module.exports = Borrower;
