import Wallet from '../../src/Wallet.js';

describe("Wallet", () => {
    describe("generateWallet()", () => {
      it("should require a passphrase be entered")
      it("should return a new mnemonic seed + public key")
      it("should save a local copy of the V3 wallet")
      it("should not generate the same mnemonic twice")
    })

    describe("getWallet(address, passphrase)", () => {
      it("should throw if no wallet with the corresponding address exists")
      it("should throw if passphrase is incorrect")
      it("should retrieve the wallet successfuly if passphrase is correct")
    })
})
