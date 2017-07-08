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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RAA_ROOT = 'https://risk.dharma.io';

var Borrower = function () {
  function Borrower(dharma) {
    var raaRoot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : RAA_ROOT;

    _classCallCheck(this, Borrower);

    this.dharma = dharma;
    this.auth = new _Authenticate2.default();
    this.raaUri = raaRoot;
  }

  _createClass(Borrower, [{
    key: 'requestAttestation',
    value: async function requestAttestation(borrower, amount) {
      var authKey = await this.auth.getAuthKey();

      var params = this._getRequestParams('/requestLoan', { authKey: authKey });
      var response = await (0, _requestPromise2.default)(params);
      if ('error' in response) {
        switch (response.error) {
          case 'INVALID_AUTH_TOKEN':
            throw new _Errors.AuthenticationError('Invalid Authentication Token');
          case 'LOAN_REQUEST_REJECTED':
            throw new _Errors.RejectionError('Your loan request has been rejected.');
          default:
            throw new Error(response.error);
        }
      }

      var loan = await this.dharma.loans.create(response);
      await loan.verifyAttestation();

      return loan;
    }
  }, {
    key: 'broadcastLoanRequest',
    value: async function broadcastLoanRequest(loan, deployedCallback, reviewCallback) {
      this.loan = loan;
      var _this = this;
      var createdEvent = await loan.events.created();
      createdEvent.watch(function (err, result) {
        createdEvent.stopWatching(function () {
          deployedCallback(err, result);

          if (err) return;

          loan.events.auctionCompleted().then(function (auctionCompletedEvent) {
            auctionCompletedEvent.watch(function (err, result) {
              if (err) {
                reviewCallback(err, null);
              } else {
                _this.getBestBidSet(loan).then(function (result) {
                  createdEvent.stopWatching(function (err) {
                    if ('error' in result) reviewCallback(result, null);else reviewCallback(null, result);
                  });
                });
              }
            });
          });
        });
      });

      await loan.broadcast();
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
    key: '_getRequestParams',
    value: function _getRequestParams(endpoint) {
      var queries = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return {
        uri: this.raaUri + endpoint,
        qs: queries,
        headers: {
          'User-Agent': 'Request-Promise'
        },
        json: true
      };
    }
  }]);

  return Borrower;
}();

module.exports = Borrower;