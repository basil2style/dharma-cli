'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Authenticate = require('./Authenticate.js');

var _Authenticate2 = _interopRequireDefault(_Authenticate);

var _Config = require('./Config.js');

var _Config2 = _interopRequireDefault(_Config);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _Errors = require('./Errors.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Faucet = function () {
  function Faucet(dharma) {
    _classCallCheck(this, Faucet);

    this.dharma = dharma;
    this.web3 = dharma.web3;
    this.auth = new _Authenticate2.default();
    this.raaUri = _Config2.default.RAA_API_ROOT;
  }

  _createClass(Faucet, [{
    key: 'requestEther',
    value: async function requestEther(wallet, amount) {
      var authToken = await this.auth.getAuthToken();

      var params = this._getRequestParams('/faucet', {
        authToken: authToken,
        address: wallet.getAddress(),
        amount: amount
      });

      try {
        var _response = await (0, _requestPromise2.default)(params);
      } catch (res) {
        if ('error' in res.error) {
          switch (res.error.error) {
            case 'INVALID_AUTH_TOKEN':
              throw new _Errors.AuthenticationError('Invalid Authentication Token');
              break;
            case 'INVALID_ADDRESS':
              throw new Error("Borrower address is invalid.");
              break;
            case 'FAUCET_REQUEST_REJECTED':
              throw new _Errors.RejectionError('Sorry -- your faucet drip request has been ' + ' rejected because you already received ether from the faucet within the past few days');
              break;
            case 'INVALID_AMOUNT':
              throw new Error('Invalid amount requested.');
              break;
            default:
              throw new Error(res.error.error);
          }
        } else {
          throw new Error(res);
        }
      }

      return response.txHash;
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

  return Faucet;
}();

module.exports = Faucet;