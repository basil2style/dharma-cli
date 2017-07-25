<p align="center">
  <img height='150px' src="https://s3-us-west-2.amazonaws.com/dharma-cli-gifs/DharmaGold.png" />
</p>


<h1 align="center">Dharma Command Line Interface</h1>

> [Dharma](https://dharma.io) is a protocol for unsecured, peer-to-peer cryptocurrency lending built on top of Ethereum smart contracts.  Our first testnet release is the Dharma CLI -- a command line tool that makes it easy to:
1. **Access a programmatic line of crypto credit from the command line in under 5 minutes**

<p align="center">
  <img src="https://s3-us-west-2.amazonaws.com/dharma-cli-gifs/BorrowerCLIFast.gif" />
</p>

2. **Build bots that auto-invest in a portfolio of loans under hyper-customizable, programmable criteria**

<p align="center">
  <img src="https://s3-us-west-2.amazonaws.com/dharma-cli-gifs/InvestorCLIFast.gif" />
</p>


See [installation instructions](#installation) below to give it a try, and check out the Dharma Protocol [White Paper](https://dharma.io/whitepaper) for more extensive information on the specifics of the protocol.  

The Dharma CLI runs on a private Ethereum Testnet spun up specifically for demonstration purposes.  However, _nothing_ about the protocol or implementation requires usage of permissioned or private chains, and we intend on moving the implementation to a public chain in the near future.  

This is highly experimental, alpha-stage **\~mAd\~SciEncE\~**, so any and all bug reports, uncompromising feedback, and issue reports are welcome.  

## Table of Contents
1. [Installation](#installation)
2. [Usage](#usage)
2. [Overview](#overview)
3. [How It Works](#how-it-works)
4. [Decision Engine Documentation](#decision-engine)
5. Future Work


### Installation
The Dharma CLI runs in a node environment.  In order to install the CLI, run the following in your command line:
```bash
# The following two commands are necessary in order to install scrypt for the first time
$ npm install -g node-gyp
$ npm install scrypt

$ npm install -g dharma-cli
```

If you run into installation errors related to the `scrypt` package, make sure you have `g++` installed and configured locally.  If you run into any other installation snags, please open up an issue and I'd be happy to take a look and assist you.

## Usage

### For borrowers...
```bash
$ dharma borrow
```

The CLI will guide you through a wizard that in which you will generate a client-side wallet, verify your identity, and then decide on the loan parameters you desire.

### For lenders...
```bash
$ dharma invest <decisionEnginePath>
```

The CLI will start up a daemon that automatically bids on loans in the Dharma network according to the criteria stipulated by the Javascript file pointed to by `decisionEnginePath`.  The CLI will open a dashboard that allows investors to get a live snapshot of their portfolio over time.

For example, one could write a decision engine that bids on loans on the basis of a simple, fixed risk-to-interest ratio:

```javascript
const RISK_TO_INTEREST_RATIO = 0.8;
const MAXIMUM_DEFAULT_RISK = 0.5;

class DecisionEngine {
  constructor(web3) {
    this.web3 = web3;
  }

  async decide(loan) {
    if (loan.defaultRisk.gt(MAXIMUM_DEFAULT_RISK))
      return false;

    return {
      amount: loan.principal,
      minInterestRate: loan.defaultRisk.times(RISK_TO_INTEREST_RATIO)
    }
  }
}
```

Or, alternatively, one could write a decision engine that bids on loans on the basis of current macro interest rates, benchmark data from existing online lenders, the Pisces horoscope on any given day -- really _anything_.

For more specifics on how to write a decision engine, check out the [decision engine documentation](#decision-engine-documentation).

### For everything else...


```bash
$ dharma faucet
```

Opens up a wizard for requesting free testnet ether from Dharma's faucet.

```bash
$ dharma init <path>
```

Creates an example decision engine at the given path

```bash
$ dharma wallet
```

Opens up a wizard for managing your funds, sending test ether to friends,
and making loan repayments.

```bash
$ dharma authenticate <authToken>
```

Saves an auth token locally for future use.  This allows you to solicit attestations from Dharma Labs Inc. and, in turn, access credit on the Dharma Network (see [Overview](#overview) onwards).


## Overview
Loans in the Dharma Protocol can be thought of as miniature, borrower-initiated ICO's -- each loan is codified as a crowdfunding contract with attached metadata for loan terms, interest rates, and miscellaneous parameters.  The smart contract serves as a vehicle for crowdfunding the loan, storing loan terms & parameters, distributing repayments to investors on a pro-rated basis according to each investor's individual contribution, and tracking borrower defaults and delinquencies.

When an investor contributes to a loan's crowdfund, they receive ERC20 tokens representing their ownership and rights to future cash flows in the loans.  As such, loan tokens can be easily combined and repackaged into smart contracts representing virtually any tranched derivative asset.  Moreover, loan tokens are as transferrable as any other digital asset, meaning they can (in theory) be bought and sold on exchanges.

Credit risk assessment and identity verification is performed by trusted, centralized third parties known as _Risk Assessment Attestors_ (RAAs).  For a pre-defined fee that is codified into the loan contract, RAAs use whatever means are at their disposal to assess a borrower's creditworthiness and cryptographically sign a statement predicting the borrower's likelihood of default.  In theory, market forces should gravitate loan volume towards those RAAs that produce better default risk predictions than others, given that a loan's performance can easily be audited ex post facto on chain.  Dharma Labs Inc. currently acts as the sole RAA of the protocol, but, in the future, we plan on developing decentralized mechanisms for authenticating other RAAs into the system.


## How It Works

Loans in the Dharma Protocol can be thought of as simple crowdfunding contracts with attached lending-specific metadata.  In practice, loans aren't represented by individual smart contracts, but rather, for gas cost-saving reasons, stored within a meta-contract that manages loan mechanics in the entire Dharma Loan network.  If a borrower wants a loan in the Dharma Protocol, they first must solicit a signed attestation from an RAA, at which point they create a loan request contract within the larger meta-contract with the following included:
1. The RAA's signed attestation
2. Their desired principal amount
3. The terms of the loan
4. Parameters around the timeline of the auction (i.e. the length of the auction in blocks)

Then, a fixed amount of time (denominated in blocks) is allotted for an auction period, in which investors can submit bids on the contract asserting their desired interest rates.  Bidding consists of sending the contract a deposit equal to the maximum amount of ether the lender is willing to invest in the contract, and specifying the minimum interest rate the lender is willing to receive for that amount. Once the auction period is complete, the borrower can submit to the contract any subset of the investors' bids whose total cash amount is equal to the desired principal + the RAA's pre-defined fee. The contract then assigns the loan an interest rate equal to the maximum of the accepted bids' interest rates and transfers the principal to the borrower.  Lenders are then allowed to withdraw the remainder and / or entirety of their previous bids from the contract.

Borrower repayments are made directly to the smart contract, which automatically distributes payouts to the investors on a pro-rata basis according to each investor's individual contribution.

If a borrower defaults on a loan or is delinquent in their payments, their default will be visible on-chain, and their likelihood of receiving creditworthiness attestations from RAAs in the future will be greatly reduced.

## Decision Engine Documentation

The Dharma CLI ingests ES7 Javascript classes that are required to expose a constructor and `async` method of the following format:
```javascript
 constructor(web3) {
   this.web3 = web3;
 }

 async decide(loan) {
   /*
     Decision logic goes here
         e.g. if (loan.defaultRisk < X && loan.principal > Y) { ... }

     If IS NOT bidding on loan, returns false

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
     by lenders.
   */
 }
```

##### The `loan` object exposes the following instance variables:
---
```javascript
  loan.uuid
```
**Returns**

`string` - The uuid of the given loan request.


---
```javascript
  loan.principal
```
**Returns**

`BigNumber` - A BigNumber instance representing the principal requested in
    Wei

---
```javascript
  loan.borrower
```
**Returns**

`String` - The Ethereum address of the borrower

---
```javascript
  loan.terms
```
**Returns**

`Terms` - The signed `Terms` object associated with the loan request (see `Terms` schema below)

---
```javascript
  loan.attestor
```
**Returns**

`String` - The Ethereum address of the RAA attesting to the given loan.

---
```javascript
  loan.attestorFee
```
**Returns**

`BigNumber` - A BigNumber instance representing the fee collected by the attestor in Wei.  The fee is a fixed sum that is socialized across all investors in the loan (i.e. if an investor contributes 2/3 of the loan principal, they will pay 2/3 of the attestor fee)

---
```javascript
  loan.defaultRisk
```
**Returns**

`BigNumber` - A BigNumber instance representing the likelihood of default, as predicted by the RAA associated with this loan.

---
```javascript
  loan.signature
```
**Returns**
An object with the following keys comprising the RAA's ECDSA signature of a stringified JSON object containing all of the above key-value pairs:

```javascript
{
  r: <BigNumber>
  s: <BigNumber>
  v: <BigNumber>
}
```

---

```javascript
  loan.auctionPeriodLength
```
**Returns**

`BigNumber` - A BigNumber instance representing the length of the loan's auction period, in blocks.

---

```javascript
  loan.reviewPeriodLength
```
**Returns**

`BigNumber` - A BigNumber instance representing the length of the loan's review period, in blocks.

___

##### The `Terms` object exposes the following instance variables:

____

```javascript
  terms.version
```
**Returns**

`BigNumber` - Current version of the terms schema

____

```javascript
  terms.periodType
```
**Returns**

`String` - The time units in which the amortization periods of the loan are denominated in.  Can be exclusively of types: `daily`, `weekly`, `monthly`, and `yearly`

____

```javascript
  terms.periodLength
```
**Returns**

`BigNumber` - The length of each payment period, in terms of `periodType` (i.e. if each payment period lasts 2 weeks, `terms.periodType = 'weekly'` and `terms.periodLength = 2`)

____

```javascript
  terms.termLength
```
**Returns**

`BigNumber` - The number of payment periods in the entire loan term  (i.e. if the entire term of the loan is 2 months and payments are expected every two weeks, `terms.periodType = 'weekly'`, `terms.periodLength = 2`, and `terms.termLength = 4`)

___

```javascript
  terms.compounded
```

**NOTE**: Currently, only non-compounded interest rates are supported by the CLI, so this variable is, by default, false.

**Returns**

`Boolean` - True or false indicating whether or not interest is compounded on the loan.
