import EthereumJSWallet from 'ethereumjs-wallet';
import HDKey from 'ethereumjs-wallet/hdkey';
import BIP39 from 'bip39';
import os from 'os';
import fs from 'fs-extra';
import ethUtils from 'ethereumjs-util';
import Util from './Util';
import WalletSubprovider from 'ethereumjs-wallet/provider-engine';

const DERIVATION_PATH = "m/44'/60'/0'/0";

class Wallet {
  constructor(ethJSWallet, mnemonic=null) {
    this.mnemonic = mnemonic;
    this.ethJSWallet = ethJSWallet;
    this.storeFile = os.homedir() + '/.dharma/wallet.json';
  }

  getMnemonic() {
    if (!this.mnemonic)
      throw new Error("Mnemonics cannot be retrieved from local wallets.");
  }

  getAddress() {
    const pubKey = this.ethJSWallet.getPublicKey();
    return ethUtils.bufferToHex(ethUtils.pubToAddress(pubKey));
  }

  getPrivateKey() {
    const privKey = this.ethJSWallet.getPublicKey();
    return ethUtils.bufferToHex(privKey);
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

  getSubprovider() {
    return new WalletSubprovider(this.ethJSWallet, {});
  }

  static async generate(passphrase) {
    if (!passphrase)
      throw new Error('User must enter passphrase.');

    const mnemonic = BIP39.generateMnemonic();
    const seed = BIP39.mnemonicToSeed(mnemonic);
    const masterNode = HDKey.fromMasterSeed(seed);
    const node = masterNode.derivePath(DERIVATION_PATH);

    const ethJSWallet = node.getWallet();
    const wallet = new Wallet(ethJSWallet, mnemonic);

    await wallet.save(passphrase);

    return wallet;
  }

  static async getWallet(address, passphrase) {
    const storeFile = os.homedir() + '/.dharma/wallet.json';
    address = Util.stripZeroEx(address);

    let wallets;
    try {
      wallets = await fs.readJson(storeFile);
    } catch (err) {
      throw new Error('No such wallet exists.');
    }

    if (!(address in wallets))
      throw new Error('No such wallet exists.');

    try {
      const ethJSWallet = EthereumJSWallet.fromV3(wallets[address], passphrase)
      return new Wallet(ethJSWallet);
    } catch (err) {
      throw new Error("Passphrase is incorrect.");
    }
  }
}

module.exports = Wallet
