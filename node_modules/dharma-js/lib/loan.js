import RedeemableERC20 from './RedeemableErc20.js';
import LoanContract from './contract_wrappers/LoanContract.js';
import Config from '../config.js';
import request from 'request-promise';
import LoanSchema from './schemas/LoanSchema.js';
import BidSchema from './schemas/BidSchema.js';
import Events from './events/Events.js';
import Attestation from './Attestation.js';
import Terms from './Terms.js';
import Util from './Util.js';
import Constants from './Constants.js';
import Servicing from './Servicing.js';
import StateListeners from './StateListeners.js';
import _ from 'lodash';

const UNDEFINED_GAS_ALLOWANCE = 500000;

class Loan extends RedeemableERC20 {
  constructor(web3, params) {
    super(web3, params);
  }

  static async create(web3, params) {
    let loan = new Loan(web3, params);
    loan.web3 = web3;

    const schema = new LoanSchema(web3);
    schema.validate(params);

    loan.uuid = params.uuid;
    loan.borrower = params.borrower;
    loan.principal = new web3.BigNumber(params.principal);
    loan.terms = new Terms(web3, params.terms);
    loan.attestor = params.attestor;
    loan.attestorFee = new web3.BigNumber(params.attestorFee);
    loan.defaultRisk = new web3.BigNumber(params.defaultRisk);
    loan.signature = params.signature;
    loan.auctionPeriodLength = new web3.BigNumber(params.auctionPeriodLength);
    loan.reviewPeriodLength = new web3.BigNumber(params.reviewPeriodLength);

    if (params.interestRate)
      loan.interestRate = new web3.BigNumber(params.interestRate);
    if (params.termBeginBlockNumber)
      loan.termBeginBlockNumber = new web3.BigNumber(params.termBeginBlockNumber);
    if (params.termBeginTimestamp)
      loan.termBeginTimestamp = new web3.BigNumber(params.termBeginTimestamp);
    if (params.auctionPeriodEndBlock)
      loan.auctionPeriodEndBlock = new web3.BigNumber(params.auctionPeriodEndBlock);
    if (params.reviewPeriodEndBlock)
      loan.reviewPeriodEndBlock = new web3.BigNumber(params.reviewPeriodEndBlock);

    loan.attestation = new Attestation(loan.web3, {
      uuid: loan.uuid,
      borrower: loan.borrower,
      principal: loan.principal,
      terms: loan.terms.toByteString(),
      attestor: loan.attestor,
      attestorFee: loan.attestorFee,
      defaultRisk: loan.defaultRisk,
    })

    if (loan.signature)
      loan.verifyAttestation();

    loan.events = new Events(web3, { uuid: loan.uuid });
    loan.servicing = new Servicing(loan);
    loan.stateListeners = new StateListeners(web3, loan);

    await loan.stateListeners.refresh();

    return loan;
  }

  toJson() {
    let json = {
      uuid: this.uuid,
      borrower: this.borrower,
      principal: this.principal,
      attestor: this.attestor,
      attestorFee: this.attestorFee,
      terms: this.terms.toJson(),
      defaultRisk: this.defaultRisk,
      signature: this.signature,
      auctionPeriodLength: this.auctionPeriodLength,
      reviewPeriodLength: this.reviewPeriodLength
    }

    if (this.interestRate)
      json.interestRate = this.interestRate
    if (this.termBeginBlockNumber)
      json.termBeginBlockNumber = this.termBeginBlockNumber
    if (this.termBeginTimestamp)
      json.termBeginTimestamp = this.termBeginTimestamp
    if (this.auctionPeriodEndBlock)
      json.auctionPeriodEndBlock = this.auctionPeriodEndBlock;
    if (this.reviewPeriodEndBlock)
      json.reviewPeriodEndBlock = this.reviewPeriodEndBlock;

    return json;
  }

  equals(loan) {
    return (
      loan.uuid === this.uuid &&
      loan.borrower === this.borrower &&
      loan.principal.equals(this.principal) &&
      loan.terms.equals(this.terms) &&
      loan.attestor === this.attestor &&
      loan.attestorFee.equals(this.attestorFee) &&
      loan.defaultRisk.equals(this.defaultRisk) &&
      _.isEqual(loan.signature, this.signature) &&
      loan.auctionPeriodLength.equals(this.auctionPeriodLength) &&
      loan.reviewPeriodLength.equals(this.reviewPeriodLength)
    )
  }

  async broadcast(options) {
    const contract = await LoanContract.instantiate(this.web3);

    options = options ||
      { from: this.web3.eth.defaultAccount };

    const loanExists = await this.exists();
    if (loanExists) {
      throw new Error('Cannot broadcast loan request -- loan request with ' +
        'conflicting UUID already exists.');
    }

    if (typeof options.gas === 'undefined') {
      options.gas = UNDEFINED_GAS_ALLOWANCE;
    }

    return contract.createLoan(
      this.uuid,
      this.borrower,
      this.web3.toHex(this.principal),
      this.terms.toByteString(),
      this.attestor,
      this.web3.toHex(this.attestorFee),
      this.web3.toHex(this.defaultRisk),
      this.signature.r,
      this.signature.s,
      this.signature.v,
      this.web3.toHex(this.auctionPeriodLength),
      this.web3.toHex(this.reviewPeriodLength),
      options
    );
  }

  async exists() {
    const contract = await LoanContract.instantiate(this.web3);
    const borrower = await contract.getBorrower.call(this.uuid);

    return (this.web3.toDecimal(borrower) > 0);
  }

  static async broadcast(web3, params, options) {
    const loan = await Loan.create(web3, params);
    await loan.broadcast(options);
  }

  async bid(amount, tokenRecipient, minInterestRate, options) {
    const contract = await LoanContract.instantiate(this.web3);

    options = options ||
      { from: tokenRecipient };

    if (typeof options.gas === 'undefined') {
      options.gas = UNDEFINED_GAS_ALLOWANCE;
    }

    if (!this.web3.isAddress(tokenRecipient))
      throw new Error("Token recipient must be valid ethereum address.");

    options.value = amount;
    return contract.bid(
      this.uuid,
      tokenRecipient,
      this.web3.toHex(minInterestRate),
      options
    );
  }

  async getBids() {
    const contract = await LoanContract.instantiate(this.web3);

    const numBids = await contract.getNumBids.call(this.uuid);

    const bids = await Promise.all(_.range(numBids).map(async (index) => {
      const bid = await contract.getBidByIndex.call(this.uuid, index);
      return {
        bidder: bid[0],
        amount: bid[1],
        minInterestRate: bid[2]
      }
    }))

    return bids;
  }

  async getBid(bidder) {
    const contract = await LoanContract.instantiate(this.web3);

    const bid = await contract.getBidByAddress.call(this.uuid, bidder);
    return {
      bidder: bid[0],
      amount: bid[1],
      minInterestRate: bid[2]
    }
  }

  async isRefundWithdrawn(bidder) {
    const bid = await this.getBid(bidder);
    return bid.amount.equals(0);
  }

  async getContract() {
    return await LoanContract.instantiate(this.web3);
  }

  async acceptBids(bids, options) {
    const contract = await LoanContract.instantiate(this.web3);

    options = options ||
      { from: this.borrower };

    if (typeof options.gas === 'undefined') {
      options.gas = UNDEFINED_GAS_ALLOWANCE;
    }

    const bidSchema = new BidSchema(this.web3);
    let totalBidValueAccepted = new this.web3.BigNumber(0);
    for (let i = 0; i < bids.length; i++) {
      bidSchema.validate(bids[i]);
      totalBidValueAccepted = totalBidValueAccepted.plus(bids[i].amount);
    }

    if (!totalBidValueAccepted.equals(this.principal.plus(this.attestorFee)))
      throw new Error('Total value of bids accepted should equal the desired ' +
        "principal, plus the attestor's fee");

    const state = await this.getState(true);

    if (!state.equals(Constants.REVIEW_STATE)) {
      throw new Error('Bids can only be accepted during the review period.');
    }

    const web3 = this.web3;

    return await contract.acceptBids(
      this.uuid,
      bids.map((bid) => { return bid.bidder }),
      bids.map((bid) => { return web3.toHex(bid.amount) }),
      options
    )
  }

  async rejectBids(options) {
    const contract = await LoanContract.instantiate(this.web3);

    options = options ||
      { from: this.borrower };

    if (typeof options.gas === 'undefined') {
      options.gas = UNDEFINED_GAS_ALLOWANCE;
    }

    const state = await this.getState(true);

    if (!state.equals(Constants.REVIEW_STATE)) {
      throw new Error('Bids can only be rejected during the review period.');
    }

    return await contract.rejectBids(this.uuid, options)
  }

  async getState(nextBlock=false) {
    const truffleContract = await LoanContract.instantiate(this.web3);
    const contract = truffleContract.contract;

    let blockNumber;
    if (nextBlock) {
      blockNumber = await Util.getLatestBlockNumber(this.web3);
      blockNumber += 1;
    }

    const uuid = this.uuid;
    return new Promise(function(resolve, reject) {
      contract.getState.call(uuid, blockNumber, (err, state) => {
        if (err) reject(err);
        else resolve(state);
      });
    });
  }

  async getInterestRate() {
    const contract = await LoanContract.instantiate(this.web3);

    return await contract.getInterestRate.call(this.uuid);
  }

  async repay(amount, options) {
    const contract = await LoanContract.instantiate(this.web3);

    options = options ||
      { from: this.web3.eth.defaultAccount };

    options.value = amount;

    const state = await this.getState(true);

    if (!state.equals(Constants.ACCEPTED_STATE))
      throw new Error('Repayments cannot be made until loan term has begun.');

    return contract.periodicRepayment(this.uuid, options);
  }

  async withdrawInvestment(options, callback) {
    const contract = await LoanContract.instantiate(this.web3);

    options = options ||
      { from: this.web3.eth.defaultAccount };

    const state = await this.getState(true);

    if (!state.equals(Constants.REJECTED_STATE) &&
          !state.equals(Constants.ACCEPTED_STATE)) {
      throw new Error('Bids can only be withdrawn once the loan has been ' +
        'accepted or rejected.');
    }

    return contract.withdrawInvestment(this.uuid, options);
  }

  async amountRepaid(options) {
    const contract = await LoanContract.instantiate(this.web3);

    options = options ||
      { from: this.web3.eth.defaultAccount };

    return contract.getAmountRepaid.call(this.uuid, options);
  }

  async getRedeemableValue(investor, options) {
    const contract = await LoanContract.instantiate(this.web3);

    options = options ||
      { from: this.web3.eth.defaultAccount };

    return contract.getRedeemableValue.call(this.uuid, investor, options);
  }

  async signAttestation() {
    this.signature = await this.attestation.sign();
  }

  verifyAttestation() {
    const validSignature = this.attestation.verifySignature(this.signature);
    if (!validSignature)
      throw new Error('Attestation has invalid signature!');
  }

}

module.exports = Loan;
