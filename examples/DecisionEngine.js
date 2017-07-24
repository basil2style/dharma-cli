/**
 * Sample Decision Engine:
 *
 * Every time a loan request is created on the Dharma Loan network,
 * the investor daemon calls the 'decide' function of the Decision Engine
 * in use, passing in the current loan object.  See ____ for documentation on
 * the methods and variables exposed by the loan object.
 */

class DecisionEngine {
  constructor(web3) {
    this.web3 = web3;
  }

  async decide(loan) {
    /*
      Decision logic goes here
          e.g. if (loan.defaultRisk < X && loan.principal > Y) { ... }

      If IS NOT bidding on loan, returns null

      If IS bidding on loan, returns object of the following form:
    */
    return {
      /*
        Amount the investor wishes to bid on the loan, in Wei

            amount: <BigNumber>
      */
      amount: new this.web3.BigNumber(2*(10**18)),

      /*
        Minimum interest rate the investor is willing to accept for the loan.
        NOTE: since Solidity does not support floats, interest rates are
        expressed as 18 decimal BigNumbers (e.g. 23% interest = 0.23 * (10**18))

            minInterestRate: <BigNumber>
      */
      minInterestRate: new this.web3.BigNumber(0.23*(10**18))
    }

    /*
      Once the auction period is over, if enough bids have been cast, the
      borrower will choose whether or not to accept the given interest rate, and
      the unaccepted bids / remaining portions of accepted bids can be withdrawn
      by lenders.  For a more extensive description of the loan auctioning 
      process, see ___________
    */
  }
}

module.exports = DecisionEngine;
