class DecisionEngine {
  constructor(web3) {
    this.web3 = web3;
  }

  async decide(loan) {
    return {
      amount: new this.web3.BigNumber(2*(10**18)),
      minInterestRate: new this.web3.BigNumber(0.23*(10**18))
    }
  }
}

module.exports = DecisionEngine;
