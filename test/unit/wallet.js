import Wallet from '../../src/Wallet.js';
import expect from 'expect.js';
import {web3} from '../init.js';
import BIP39 from 'bip39';
import mock from 'mock-fs'
import fs from 'fs-extra';
import _ from 'lodash';
import Util from '../../src/Util.js';
import WalletSubprovider from 'ethereumjs-wallet/provider-engine';

describe("Wallet", () => {
  let wallet;

  before(() => {
    mock();
  })

  after(mock.restore);

  describe("generateWallet()", () => {
    it("should require a passphrase be entered", async () => {
      try {
        wallet = await Wallet.generate("")
        expect().fail("should throw error");
      } catch (err) {
        expect(err.toString()).to.contain("must enter passphrase.");
      }
    })

    it("should return a new mnemonic seed + public key", async () => {
      wallet = await Wallet.generate("passphrase");
      expect(web3.isAddress(wallet.getAddress())).to.be(true);
      expect(BIP39.validateMnemonic(wallet.mnemonic)).to.be(true);
    })

    it("should save a local copy of the V3 wallet", async () => {
      const savedWallet = await fs.readJson(wallet.storeFile);
      const address = Util.stripZeroEx(wallet.getAddress());

      expect(savedWallet).to.have.key(address);
    })

    it("should not generate the same mnemonic twice", async () => {
      const secondWallet = await Wallet.generate("passphrase");
      expect(secondWallet.mnemonic).to.not.be(wallet.mnemonic);
    })
  })

  describe("getWallet(address, passphrase)", () => {
    let retrievedWallet;

    it("should throw if no wallet with the corresponding address exists", async () => {
      const exampleAddress = '0xbd575ef88b3b7d0080a944564a7d886365703dde';
      try {
        retrievedWallet = await Wallet.getWallet(exampleAddress, "passphrase");
        expect().fail("should throw error");
      } catch (err) {
        expect(err.toString()).to.contain("No such wallet exists.");
      }
    })

    it("should throw if passphrase is incorrect", async () => {
      try {
        retrievedWallet = await Wallet.getWallet(wallet.getAddress(), "incorrect");
        expect().fail("should throw error");
      } catch (err) {
        expect(err.toString()).to.contain("Passphrase is incorrect.");
      }
    })

    it("should retrieve the wallet successfuly if passphrase is correct", async () => {
      retrievedWallet = await Wallet.getWallet(wallet.getAddress(), "passphrase");
      expect(retrievedWallet.getAddress()).to.be(wallet.getAddress());
    })
  })

  describe("getSubprovider(passphrase)", () => {
    it("should return the subprovider associated w/ the given wallet", () => {
      const subprovider = wallet.getSubprovider("passphrase");
      expect(subprovider instanceof WalletSubprovider).to.be(true);
    });
  })
})
