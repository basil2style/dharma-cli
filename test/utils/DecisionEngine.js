class DecisionEngine {
  constructor(web3, wallet) {
    this.web3 = web3;
    this.wallet = wallet;
  }

  async decide(loan) {
    console.log("mazel tov!");
    console.log("Bidding on loan " + loan.uuid + " from address " + this.wallet.getAddress());
    return {
      bidder: this.wallet.getAddress(),
      amount: new this.web3.BigNumber(2*(10**18)),
      minInterestRate: new this.web3.BigNumber(0.23*(10**18))
    }
  }
}

module.exports = DecisionEngine;
