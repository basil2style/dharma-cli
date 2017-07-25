import LoanContract from './contract_wrappers/LoanContract.js';
import Constants from './Constants.js';

class RedeemableERC20 {
  constructor(web3, uuid) {
    this.web3 = web3;
    this.uuid = uuid;
  }

  async transfer(tokenRecipient, value, options) {
    const contract = await LoanContract.instantiate(this.web3);

    options = options ||
      { from: this.web3.eth.defaultAccount };

    const balance = await this.balanceOf(options.from);
    if (balance.lt(value)) {
      throw new Error("Your account balance is not high enough to transfer " +
        value.toString() + " wei.");
    }

    return contract.transfer(this.uuid, tokenRecipient, value, options);
  }

  async getRedeemableValue(tokenHolder, options) {
    const contract = await LoanContract.instantiate(this.web3);

    options = options ||
      { from: this.web3.eth.defaultAccount };

    return contract.getRedeemableValue.call(this.uuid, tokenHolder, options);
  }

  async redeemValue(recipient, options) {
    const contract = await LoanContract.instantiate(this.web3);

    const state = await contract.getState.call(this.uuid);
    if (!state.equals(Constants.ACCEPTED_STATE)) {
      throw new Error("Value cannot be redeemed until the loan term has begun.");
    }

    options = options ||
      { from: recipient };

    const balance = await this.balanceOf(options.from);
    if (!balance.gt(0)) {
      throw new Error("Value cannot be redeemed by non-investors.");
    }

    return contract.redeemValue(this.uuid, recipient, options);
  }

  async balanceOf(account, options) {
    const contract = await LoanContract.instantiate(this.web3);

    options = options ||
      { from: this.web3.eth.defaultAccount };

    return contract.balanceOf.call(this.uuid, account, options);
  }

  async approve(spender, value, options) {
    const contract = await LoanContract.instantiate(this.web3);

    options = options ||
      { from: this.web3.eth.defaultAccount };

    return contract.approve(this.uuid, spender, value, options);
  }

  async allowance(owner, spender, options) {
    const contract = await LoanContract.instantiate(this.web3);

    options = options ||
      { from: this.web3.eth.defaultAccount };

    return contract.allowance.call(this.uuid, owner, spender, options);
  }

  async transferFrom(from, to, value, options) {
    const contract = await LoanContract.instantiate(this.web3);

    options = options ||
      { from: this.web3.eth.defaultAccount };

    const allowance = await this.allowance(from, options.from);
    if (allowance.lt(value)) {
      throw new Error("Your allowance on account " + from + " is not high enough to transfer " +
        value.toString() + " wei.");
    }

    return contract.transferFrom(this.uuid, from, to, value, options);
  }
}

module.exports = RedeemableERC20;
