'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Authenticate = require('./Authenticate');

var _Authenticate2 = _interopRequireDefault(_Authenticate);

var _Errors = require('./Errors');

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bignumber = require('bignumber.js');

var _bignumber2 = _interopRequireDefault(_bignumber);

var _Util = require('./Util');

var _Util2 = _interopRequireDefault(_Util);

var _Config = require('./Config');

var _Config2 = _interopRequireDefault(_Config);

var _Liabilities = require('./models/Liabilities');

var _Liabilities2 = _interopRequireDefault(_Liabilities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MIN_GAS_REQUIRED = 500000;
var GAS_PRICE_IN_GWEI = 18;

var Borrower = function () {
  function Borrower(dharma) {
    _classCallCheck(this, Borrower);

    this.dharma = dharma;
    this.web3 = dharma.web3;
    this.auth = new _Authenticate2.default();
    this.raaUri = _Config2.default.RAA_API_ROOT;
  }

  _createClass(Borrower, [{
    key: 'requestAttestation',
    value: async function requestAttestation() {
      var authenticate = new _Authenticate2.default();
      var authToken = await authenticate.getAuthToken();

      var params = this._getRequestParams('/requestAttestation', {
        authToken: authToken
      });

      var response = void 0;
      try {
        response = await (0, _requestPromise2.default)(params);
        console.log(response);
      } catch (err) {
        if (err.name === 'StatusCodeError') {
          switch (err.response.body.error) {
            case 'INVALID_AUTH_TOKEN':
              throw new _Errors.AuthenticationError('Invalid Authentication Token');
              break;
            case 'INVALID_ADDRESS':
              throw new Error("Borrower address is invalid.");
              break;
            case 'ATTESTATION_REJECTED':
              throw new _Errors.RejectionError('Your loan request has been rejected.');
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
  }, {
    key: 'requestSignedLoan',
    value: async function requestSignedLoan(borrower, amount) {
      var authenticate = new _Authenticate2.default();
      var authToken = await authenticate.getAuthToken();

      var params = this._getRequestParams('/requestSignedLoan', {
        authToken: authToken,
        address: borrower,
        amount: amount
      });

      var response = void 0;
      try {
        response = await (0, _requestPromise2.default)(params);
      } catch (err) {
        if (err.name === 'StatusCodeError') {
          switch (err.response.body.error) {
            case 'INVALID_AUTH_TOKEN':
              throw new _Errors.AuthenticationError('Invalid Authentication Token');
              break;
            case 'INVALID_ADDRESS':
              throw new Error("Borrower address is invalid.");
              break;
            case 'ATTESTATION_REJECTED':
              throw new _Errors.RejectionError('Your loan request has been rejected.');
              break;

            default:
              console.log(err);
              throw new Error(err.response.body.toString());
          }
        } else {
          throw err;
        }
      }

      var loan = await this.dharma.loans.create(response);
      await loan.verifyAttestation();

      return loan;
    }
  }, {
    key: 'requestDeploymentStipend',
    value: async function requestDeploymentStipend(address) {
      var authenticate = new _Authenticate2.default();
      var authToken = await authenticate.getAuthToken();

      var params = this._getRequestParams('/requestDeploymentStipend', {
        authToken: authToken,
        address: address
      });

      var response = await (0, _requestPromise2.default)(params);

      if ('error' in response) {
        switch (response.error) {
          case 'INVALID_AUTH_TOKEN':
            throw new _Errors.AuthenticationError('Invalid Authentication Token');
            break;
          case 'INVALID_ADDRESS':
            throw new Error("Borrower address is invalid.");
            break;
          case 'STIPEND_REQUEST_REJECTED':
            throw new _Errors.RejectionError('Your deployment stipdend request has been rejected.');
            break;

          default:
            throw new Error(response.error);
        }
      }

      return response.txHash;
    }
  }, {
    key: 'broadcastLoanRequest',
    value: async function broadcastLoanRequest(loan, deployedCallback, reviewCallback) {
      var _this = this;
      var createdEvent = await loan.events.created();
      createdEvent.watch(function (err, result) {
        createdEvent.stopWatching(function () {
          deployedCallback(err, result);

          if (err) return;

          loan.events.auctionCompleted().then(function (auctionCompletedEvent) {
            auctionCompletedEvent.watch(function (err, result) {
              auctionCompletedEvent.stopWatching(function () {
                if (err) {
                  reviewCallback(err, null);
                } else {
                  _this.getBestBidSet(loan).then(function (result) {
                    if ('error' in result) reviewCallback(result, null);else reviewCallback(null, result);
                  });
                }
              });
            });
          });
        });
      });

      var balance = await _Util2.default.getBalance(this.web3, loan.borrower);
      await loan.broadcast({ from: loan.borrower });
    }
  }, {
    key: 'acceptLoanTerms',
    value: async function acceptLoanTerms(loan, bids) {
      await loan.acceptBids(bids);

      var liabilities = void 0;
      try {
        liabilities = await _Liabilities2.default.load(this.dharma);
      } catch (err) {
        liabilities = new _Liabilities2.default();
      }

      liabilities.addLoan(loan);
      await liabilities.save();
    }
  }, {
    key: 'getBestBidSet',
    value: async function getBestBidSet(loan) {
      var bids = await loan.getBids();
      var sortedBids = _lodash2.default.sortBy(bids, ['minInterestRate']);
      var totalNeeded = loan.principal.plus(loan.attestorFee);
      var totalRaised = new _bignumber2.default(0);
      var bestInterestRate = new _bignumber2.default(0);
      var bestBids = [];

      sortedBids.some(function (bid) {
        var remainingBalance = totalNeeded.minus(totalRaised);
        var amountTaken = _bignumber2.default.min(remainingBalance, bid.amount);
        totalRaised = totalRaised.plus(amountTaken);
        bestInterestRate = bid.minInterestRate;

        var bidTaken = {
          bidder: bid.bidder,
          amount: amountTaken
        };
        bestBids.push(bidTaken);

        return totalRaised.equals(totalNeeded);
      });

      if (totalRaised.lt(totalNeeded)) {
        return {
          error: 'PRINCIPAL_UNMET'
        };
      } else {
        return {
          bids: bestBids,
          interestRate: bestInterestRate
        };
      }
    }
  }, {
    key: 'hasMinBalanceRequired',
    value: async function hasMinBalanceRequired(address) {
      return new Promise(function (resolve, reject) {
        this.web3.eth.getBalance(address, function (err, balance) {
          if (err) {
            reject(err);
          } else {
            if (balance.lt(this.web3.toWei(MIN_GAS_REQUIRED * GAS_PRICE_IN_GWEI, 'gwei'))) {
              resolve(false);
            } else {
              resolve(true);
            }
          }
        }.bind(this));
      }.bind(this));
    }
  }, {
    key: '_getRequestParams',
    value: function _getRequestParams(endpoint, params) {
      return {
        method: 'POST',
        uri: this.raaUri + endpoint,
        body: params,
        json: true
      };
    }
  }]);

  return Borrower;
}();

module.exports = Borrower;