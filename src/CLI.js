'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _web = require('web3');

var _web2 = _interopRequireDefault(_web);

var _dharma = require('dharma');

var _dharma2 = _interopRequireDefault(_dharma);

var _Wallet = require('./Wallet');

var _Wallet2 = _interopRequireDefault(_Wallet);

var _web3ProviderEngine = require('web3-provider-engine');

var _web3ProviderEngine2 = _interopRequireDefault(_web3ProviderEngine);

var _Borrower = require('./Borrower');

var _Borrower2 = _interopRequireDefault(_Borrower);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CLI = function () {
  function CLI(dharma) {
    _classCallCheck(this, CLI);

    this.dharma = dharma;
    this.borrower = new _Borrower2.default(dharma);
  }

  _createClass(CLI, [{
    key: 'borrow',
    value: function borrow(amount, address) {
      console.log("here");
    }
  }], [{
    key: 'init',
    value: async function init() {
      var walletExists = await _Wallet2.default.walletExists();
      var wallet = void 0;
      if (walletExists) {
        wallet = await CLI.loadWalletFlow();
      } else {
        wallet = await CLI.generateWalletFlow();
      }

      var engine = new _web3ProviderEngine2.default();
      var web3 = new _web2.default(engine);

      engine.addProvider(wallet.getSubprovider());
      engine.addProvider(new RpcSubprovider({
        rpcUrl: 'https://localhost:8546'
      }));
      engine.start();

      var dharma = new _dharma2.default(web3);

      return new CLI(dharma);
    }
  }]);

  return CLI;
}();