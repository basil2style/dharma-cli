# Dharma Command Line Interface
Dharma is a protocol for unsecured, peer-to-peer cryptocurrency lending built on top of Ethereum smart contracts.  Our first testnet release is the Dharma CLI -- a command line tool that makes it easy to:
1. **Access a line of crypto credit from the command line in under 5 minutes**
![Borrower Experience Gif](https://s3-us-west-2.amazonaws.com/dharma-cli-gifs/BorrowerCLIFast.gif)

2. **Build bots that auto-invest in a portfolio of loans under hyper-customizable, programmable criteria**

    ![Borrower Experience Gif](https://s3-us-west-2.amazonaws.com/dharma-cli-gifs/InvestorCLIFast.gif)


See installation instructions below to give it a try, and check out the Dharma Protocol [White Paper](https://dharma.io/whitepaper) for more extensive information on the specifics of the protocol.  The Dharma CLI runs on a private Ethereum testnet spun up specifically for demonstration purposes -- nothing about the protocol or implementation requires usage of permissioned or private chains, and we intend on moving the implementation to a public chain in the near future.  

### Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. How It Works
    1. Loan Contracts
    2. Auction Process
    3. Credit Risk Assessment
4. Decision Engine Documentation
5. Terms Schema
5. Future Work

#### Overview
Loans in the Dharma Protocol can be thought of as mini-ICO's in their own right -- each loan is codified as a crowdfunding contract with attached metadata for loan terms, interest rates, and miscellaneous parameters.  The smart contract serves as a vehicle for crowdfunding the loan, storing loan terms & parameters, distributing repayments to investors on a pro-rated basis according to each investor's individual contribution, and tracking borrower defaults and delinquencies.

When an investor contributes to a loan's crowdfund, they receive ERC20 tokens representing their ownership and rights to future cash flows in the loans.  As such, loan tokens can be easily combined and repackaged into smart contracts representing virtually any tranched derivative asset.  Moreover, loan tokens are as transferrable as any other digital asset, meaning they can (in theory) be bought and sold on exchanges.

Credit risk assessment and identity verification is performed by trusted, centralized third parties known as _Risk Assessment Attestors_ (RAAs).  For a pre-defined fee that is codified into the loan contract, RAAs use whatever means are at their disposal to assess a borrower's creditworthiness and cryptographically sign a statement predicting the borrower's likelihood of default.  In theory, market forces should gravitate loan volume towards those RAAs that produce better default risk predictions than others, given that a loan's performance can easily be audited ex post facto on chain.

#### Installation
The Dharma CLI runs in a node environment.  In order to install the CLI, run the following in your command line:
```bash
# The following two commands are necessary in order to install scrypt for the first time
npm install -g node-gyp
npm install scrypt

npm install -g dharma-cli
```

If you run into installation errors related to the `scrypt` package, make sure you have `g++` installed and configured locally.  If you run into any other installation snags, please open up an issue and I'd be happy to take a look and assist you.
