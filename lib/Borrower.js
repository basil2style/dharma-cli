import Authenticate from './Authenticate';
import {AuthenticationError, RejectionError} from './Errors';
import request from 'request-promise';
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import Util from './Util';
import Config from './Config';
import Liabilities from './models/Liabilities';

const MIN_GAS_REQUIRED = 500000;
const GAS_PRICE_IN_GWEI = 18;

class Borrower {
  constructor(dharma) {
    this.dharma = dharma;
    this.web3 = dharma.web3;
    this.auth = new Authenticate();
    this.raaUri = Config.RAA_API_ROOT;
  }

  async requestAttestation() {
    const authenticate = new Authenticate();
    const authToken = await authenticate.getAuthToken();

    const params = this._getRequestParams('/requestAttestation', {
      authToken: authToken
    });

    let response;
    try {
      response = await request(params);
      console.log(response);
    } catch (err) {
      if (err.name === 'StatusCodeError') {
        switch (err.response.body.error) {
          case 'INVALID_AUTH_TOKEN':
            throw new AuthenticationError('Invalid Authentication Token')
            break;
          case 'INVALID_ADDRESS':
            throw new Error("Borrower address is invalid.");
            break;
          case 'ATTESTATION_REJECTED':
            throw new RejectionError('Your loan request has been rejected.')
            break;

          default:
            console.log(err);
            throw new Error(err.response.body.toString());
        }
      } else {
        throw err;
      }
    }

    return response;
  }

  async requestSignedLoan(borrower, amount) {
    const authenticate = new Authenticate();
    const authToken = await authenticate.getAuthToken();

    const params = this._getRequestParams('/requestSignedLoan', {
      authToken: authToken,
      address: borrower,
      amount: amount
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
          case 'ATTESTATION_REJECTED':
            throw new RejectionError('Your loan request has been rejected.')
            break;

          default:
            console.log(err);
            throw new Error(err.response.body.toString());
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
    const authToken = await authenticate.getAuthToken();

    const params = this._getRequestParams('/requestDeploymentStipend', {
      authToken: authToken,
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

    const balance = await Util.getBalance(this.web3, loan.borrower);
    await loan.broadcast({ from: loan.borrower });
  }

  async acceptLoanTerms(loan, bids) {
    await loan.acceptBids(bids);

    let liabilities;
    try {
      liabilities = await Liabilities.load(this.dharma);
    } catch (err) {
      liabilities = new Liabilities();
    }

    liabilities.addLoan(loan);
    await liabilities.save();
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
