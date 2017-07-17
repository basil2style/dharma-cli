'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ethereumjsWallet = require('ethereumjs-wallet');

var _ethereumjsWallet2 = _interopRequireDefault(_ethereumjsWallet);

var _hdkey = require('ethereumjs-wallet/hdkey');

var _hdkey2 = _interopRequireDefault(_hdkey);

var _bip = require('bip39');

var _bip2 = _interopRequireDefault(_bip);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _ethereumjsUtil = require('ethereumjs-util');

var _ethereumjsUtil2 = _interopRequireDefault(_ethereumjsUtil);

var _Util = require('./Util');

var _Util2 = _interopRequireDefault(_Util);

var _providerEngine = require('ethereumjs-wallet/provider-engine');

var _providerEngine2 = _interopRequireDefault(_providerEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DERIVATION_PATH = "m/44'/60'/0'/0";
var DEFAULT_STORE_FILE = _os2.default.homedir() + '/.dharma/wallet.json';

var Wallet = function () {
  function Wallet(ethJSWallet) {
    var mnemonic = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var storeFile = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_STORE_FILE;

    _classCallCheck(this, Wallet);

    this.mnemonic = mnemonic;
    this.ethJSWallet = ethJSWallet;
    this.storeFile = storeFile;
  }

  _createClass(Wallet, [{
    key: 'getMnemonic',
    value: function getMnemonic() {
      if (!this.mnemonic) throw new Error("Mnemonics cannot be retrieved from local wallets.");
      return this.mnemonic;
    }
  }, {
    key: 'getAddress',
    value: function getAddress() {
      var pubKey = this.ethJSWallet.getPublicKey();
      return _ethereumjsUtil2.default.bufferToHex(_ethereumjsUtil2.default.pubToAddress(pubKey));
    }
  }, {
    key: 'getPrivateKey',
    value: function getPrivateKey() {
      var privKey = this.ethJSWallet.getPublicKey();
      return _ethereumjsUtil2.default.bufferToHex(privKey);
    }
  }, {
    key: 'getSubprovider',
    value: function getSubprovider() {
      return new _providerEngine2.default(this.ethJSWallet, {});
    }
  }, {
    key: 'save',
    value: async function save(passphrase) {
      var wallets = void 0;

      try {
        wallets = await _fsExtra2.default.readJson(this.storeFile);
      } catch (err) {
        // No wallets have been created yet.
        wallets = {};
      }

      var v3WalletObject = this.ethJSWallet.toV3(passphrase);
      var address = v3WalletObject.address;
      wallets[address] = v3WalletObject;

      await _fsExtra2.default.outputJson(this.storeFile, wallets);
    }
  }], [{
    key: 'generate',
    value: async function generate(passphrase, walletStoreFile) {
      if (!passphrase) throw new Error('User must enter passphrase.');

      var mnemonic = _bip2.default.generateMnemonic();
      var seed = _bip2.default.mnemonicToSeed(mnemonic);
      var masterNode = _hdkey2.default.fromMasterSeed(seed);
      var node = masterNode.derivePath(DERIVATION_PATH);

      var ethJSWallet = node.getWallet();
      var wallet = new Wallet(ethJSWallet, mnemonic, walletStoreFile);

      await wallet.save(passphrase);

      return wallet;
    }
  }, {
    key: 'recoverWallet',
    value: async function recoverWallet(mnemonic) {
      var storeFile = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_STORE_FILE;

      var wallets = void 0;
      try {
        wallets = await _fsExtra2.default.readJson(storeFile);
      } catch (err) {
        throw new Error('No such wallet exists.');
      }

      var address = Object.keys(wallets)[0];

      var seed = _bip2.default.mnemonicToSeed(mnemonic);
      var masterNode = _hdkey2.default.fromMasterSeed(seed);
      var node = masterNode.derivePath(DERIVATION_PATH);

      var ethJSWallet = node.getWallet();
      var wallet = new Wallet(ethJSWallet, mnemonic, storeFile);
      // const walletAddress = Util.stripZeroEx(wallet.getAddress())
      //
      // if (walletAddress !== address)
      //   throw new Error('Incorrect seed phrase.');

      return wallet;
    }
  }, {
    key: 'getWallet',
    value: async function getWallet(passphrase) {
      var storeFile = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_STORE_FILE;

      var wallets = void 0;
      try {
        wallets = await _fsExtra2.default.readJson(storeFile);
      } catch (err) {
        throw new Error('No such wallet exists.');
      }

      var address = Object.keys(wallets)[0];

      try {
        var ethJSWallet = _ethereumjsWallet2.default.fromV3(wallets[address], passphrase);
        return new Wallet(ethJSWallet);
      } catch (err) {
        throw new Error("Passphrase is incorrect.");
      }
    }
  }, {
    key: 'walletExists',
    value: async function walletExists() {
      var storeFile = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_STORE_FILE;

      try {
        var wallets = await _fsExtra2.default.readJson(storeFile);
        return true;
      } catch (err) {
        return false;
      }
    }
  }]);

  return Wallet;
}();

module.exports = Wallet;