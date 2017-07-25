import Authenticate from './Authenticate.js';
import Config from './Config.js';
import request from 'request-promise';
import { AuthenticationError, RejectionError } from './Errors.js';

class Faucet {
  constructor(dharma) {
    this.dharma = dharma;
    this.web3 = dharma.web3;
    this.auth = new Authenticate();
    this.raaUri = Config.RAA_API_ROOT;
  }

  async requestEther(wallet, amount) {
    const authToken = await this.auth.getAuthToken();

    const params = this._getRequestParams('/faucet', {
      authToken: authToken,
      address: wallet.getAddress(),
      amount: amount
    });

    let response;
    try {
      response = await request(params);
    } catch (res) {
      if ('error' in res.error) {
        switch (res.error.error) {
          case 'INVALID_AUTH_TOKEN':
            throw new AuthenticationError('Invalid Authentication Token')
            break;
          case 'INVALID_ADDRESS':
            throw new Error("Borrower address is invalid.");
            break;
          case 'FAUCET_REQUEST_REJECTED':
            throw new RejectionError('Sorry -- your faucet drip request has been ' +
              ' rejected because you already received ether from the faucet within the past few days')
            break;
          case 'INVALID_AMOUNT':
            throw  new Error('Invalid amount requested.');
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

  _getRequestParams(endpoint, params) {
    return {
      method: 'POST',
      uri: this.raaUri + endpoint,
      body: params,
      json: true
    };
  }
}

module.exports = Faucet;
