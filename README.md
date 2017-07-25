<h1 align="center">Dharma Command Line Interface</h1>

> [Dharma](https://dharma.io) is a protocol for unsecured, peer-to-peer cryptocurrency lending built on top of Ethereum smart contracts.  Our first testnet release is the Dharma CLI -- a command line tool that makes it easy to:
1. **Access a programmatic line of crypto credit from the command line in under 5 minutes**
![Borrower Experience Gif](https://s3-us-west-2.amazonaws.com/dharma-cli-gifs/BorrowerCLIFast.gif)

2. **Build bots that auto-invest in a portfolio of loans under hyper-customizable, programmable criteria**

    ![Borrower Experience Gif](https://s3-us-west-2.amazonaws.com/dharma-cli-gifs/InvestorCLIFast.gif)


See [installation instructions](#installation) below to give it a try, and check out the Dharma Protocol [White Paper](https://dharma.io/whitepaper) for more extensive information on the specifics of the protocol.  

The Dharma CLI runs on a private Ethereum Testnet spun up specifically for demonstration purposes.  However, _nothing_ about the protocol or implementation requires usage of permissioned or private chains, and we intend on moving the implementation to a public chain in the near future.  

### Table of Contents
1. [Installation](#installation)
2. [Usage](#usage)
2. [Overview](#overview)
3. [How It Works](#how-it-works)
4. [Decision Engine Documentation](#decision-engine)
5. _(TODO) Terms Schema_
6. _(TODO) Attestation Schema_
5. Future Work


#### Installation
The Dharma CLI runs in a node environment.  In order to install the CLI, run the following in your command line:
```bash
# The following two commands are necessary in order to install scrypt for the first time
$ npm install -g node-gyp
$ npm install scrypt

$ npm install -g dharma-cli
```

If you run into installation errors related to the `scrypt` package, make sure you have `g++` installed and configured locally.  If you run into any other installation snags, please open up an issue and I'd be happy to take a look and assist you.

#### Usage

##### For borrowers...
```bash
$ dharma borrow
```

The CLI will guide you through a wizard that in which you will generate a client-side wallet, verify your identity, and then decide on the loan parameters you desire.

##### For lenders...
```bash
$ dharma invest <decisionEnginePath>
```

The CLI will start up a daemon that automatically bids on loans in the Dharma network according to the criteria stipulated by the Javascript file pointed to by `decisionEnginePath`.  The CLI will open a dashboard that allows investors to get a live snapshot of their portfolio over time.

For example, one could write a decision engine that bids on loans on the basis of a simple, fixed risk-to-interest ratio:

```javascript
const RISK_TO_INTEREST_RATIO = 0.8;
const MAXIMUM_DEFAULT_RISK

class DecisionEngine {
  constructor(web3) {
    this.web3 = web3;
  }

  async decide(loan) {
    if (loan.defaulRisk)
    return {
      amount: new this.web3.BigNumber(2*(10**18)),
      minInterestRate: new this.web3.BigNumber(0.23*(10**18))
    }
  }
}
```

For more specifics on how to write a decision engine, check out the documentation

This is highly experimental, alpha-stage **~mAd~SciEncE~**, so any and all bug reports, uncompromising feedback, and issue reports are welcome.   

#### Overview
Loans in the Dharma Protocol can be thought of as miniature, borrower-initiated ICO's -- each loan is codified as a crowdfunding contract with attached metadata for loan terms, interest rates, and miscellaneous parameters.  The smart contract serves as a vehicle for crowdfunding the loan, storing loan terms & parameters, distributing repayments to investors on a pro-rated basis according to each investor's individual contribution, and tracking borrower defaults and delinquencies.

When an investor contributes to a loan's crowdfund, they receive ERC20 tokens representing their ownership and rights to future cash flows in the loans.  As such, loan tokens can be easily combined and repackaged into smart contracts representing virtually any tranched derivative asset.  Moreover, loan tokens are as transferrable as any other digital asset, meaning they can (in theory) be bought and sold on exchanges.

Credit risk assessment and identity verification is performed by trusted, centralized third parties known as _Risk Assessment Attestors_ (RAAs).  For a pre-defined fee that is codified into the loan contract, RAAs use whatever means are at their disposal to assess a borrower's creditworthiness and cryptographically sign a statement predicting the borrower's likelihood of default.  In theory, market forces should gravitate loan volume towards those RAAs that produce better default risk predictions than others, given that a loan's performance can easily be audited ex post facto on chain.  Dharma Labs Inc. currently acts as the sole RAA of the protocol, but, in the future, we plan on developing decentralized mechanisms for authenticating other RAAs into the system.


#### How It Works

Loans in the Dharma Protocol can be thought of as simple crowdfunding contracts with attached lending-specific metadata.  In practice, loans aren't represented by individual smart contracts, but rather, for gas cost-saving reasons, stored within a meta-contract that manages loan mechanics in the entire Dharma Loan network.  If a borrower wants a loan in the Dharma Protocol, they first must solicit a signed attestation from an RAA, at which point they create a loan request contract within the larger meta-contract with the following included:
1. The RAA's signed attestation
2. Their desired principal amount
3. The terms of the loan
4. Parameters around the timeline of the auction (see more in [Auction Process](#auction-process))

Then, a fixed amount of time (denominated in blocks) is allotted for an auction period, in which investors can submit bids on the contract asserting their desired interest rates.  Bidding consists of sending the contract a deposit equal to the maximum amount of ether the lender is willing to invest in the contract, and specifying the minimum interest rate the lender is willing to receive for that amount. Once the auction period is complete, the borrower can submit to the contract any subset of the investors' bids whose total cash amount is equal to the desired principal + the RAA's pre-defined fee. The contract then assigns the loan an interest rate equal to the maximum of the accepted bids' interest rates and transfers the principal to the borrower.  Lenders are then allowed to withdraw the remainder and / or entirety of their previous bids from the contract.

Borrower repayments are made directly to the smart contract, which automatically distributes payouts to the investors on a pro-rata basis according to each investor's individual contribution.

If a borrower defaults on a loan or is delinquent in their payments, their default will be visible on-chain, and their likelihood of receiving creditworthiness attestations from RAAs in the future will be greatly reduced.    
