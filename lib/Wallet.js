import EthereumJSWallet from 'ethereumjs-wallet';
import HDKey from 'ethereumjs-wallet/hdkey';
import BIP39 from 'bip39';
import os from 'os';
import fs from 'fs-extra';
import ethUtils from 'ethereumjs-util';
import Util from './Util';
import WalletSubprovider from 'ethereumjs-wallet/provider-engine';

const DERIVATION_PATH = "m/44'/60'/0'/0";
const DEFAULT_STORE_FILE = os.homedir() + '/.dharma/wallet.json';

class Wallet {
  constructor(ethJSWallet, mnemonic=null, storeFile=DEFAULT_STORE_FILE) {
    this.mnemonic = mnemonic;
    this.ethJSWallet = ethJSWallet;
    this.storeFile = storeFile;
  }

  getMnemonic() {
    if (!this.mnemonic)
      throw new Error("Mnemonics cannot be retrieved from local wallets.");
    return this.mnemonic;
  }

  getAddress() {
    const pubKey = this.ethJSWallet.getPublicKey();
    return ethUtils.bufferToHex(ethUtils.pubToAddress(pubKey));
  }

  getPrivateKey() {
    const privKey = this.ethJSWallet.getPublicKey();
    return ethUtils.bufferToHex(privKey);
  }

  getSubprovider() {
    return new WalletSubprovider(this.ethJSWallet, {});
  }

  async save(passphrase) {
    let wallets;

    try {
      wallets = await fs.readJson(this.storeFile);
    } catch (err) {
      // No wallets have been created yet.
      wallets = {}
    }

    const v3WalletObject = this.ethJSWallet.toV3(passphrase);
    const address = v3WalletObject.address;
    wallets[address] = v3WalletObject;

    await fs.outputJson(this.storeFile, wallets);
  }

  static async generate(passphrase, walletStoreFile) {
    if (!passphrase)
      throw new Error('User must enter passphrase.');

    const mnemonic = BIP39.generateMnemonic();
    const seed = BIP39.mnemonicToSeed(mnemonic);
    const masterNode = HDKey.fromMasterSeed(seed);
    const node = masterNode.derivePath(DERIVATION_PATH);

    const ethJSWallet = node.getWallet();
    const wallet = new Wallet(ethJSWallet, mnemonic, walletStoreFile);

    await wallet.save(passphrase);

    return wallet;
  }

  static async recoverWallet(mnemonic, storeFile=DEFAULT_STORE_FILE) {
    let wallets;
    try {
      wallets = await fs.readJson(storeFile);
    } catch (err) {
      throw new Error('No such wallet exists.');
    }

    const address = Object.keys(wallets)[0];

    const seed = BIP39.mnemonicToSeed(mnemonic);
    const masterNode = HDKey.fromMasterSeed(seed);
    const node = masterNode.derivePath(DERIVATION_PATH);

    const ethJSWallet = node.getWallet();
    const wallet = new Wallet(ethJSWallet, mnemonic, storeFile);
    const walletAddress = Util.stripZeroEx(wallet.getAddress())

    if (walletAddress !== address)
      throw new Error('Incorrect seed phrase.');

    return wallet;
  }

  static async getWallet(passphrase, storeFile=DEFAULT_STORE_FILE) {
    let wallets;
    try {
      wallets = await fs.readJson(storeFile);
    } catch (err) {
      throw new Error('No such wallet exists.');
    }

    const address = Object.keys(wallets)[0];

    try {
      const ethJSWallet = EthereumJSWallet.fromV3(wallets[address], passphrase)
      return new Wallet(ethJSWallet);
    } catch (err) {
      throw new Error("Passphrase is incorrect.");
    }
  }

  static async walletExists(storeFile=DEFAULT_STORE_FILE) {
    try {
      let wallets = await fs.readJson(storeFile);
      return true;
    } catch (err) {
      return false;
    }
  }
}

module.exports = Wallet
