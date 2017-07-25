import stringify from 'json-stable-stringify';
import util from './Util';
import _ from 'lodash';
import Random from 'random-js';

class LoanFactory {
  constructor(contract) {
    this.contract = contract;
  }

  static generateSignedLoan(loan) {
    const terms = LoanFactory._generateTermsByteString(loan.terms);
    let unsignedLoan = _.cloneDeep(loan);
    unsignedLoan.terms = terms;

    const loanHash = web3.sha3(stringify(unsignedLoan));
    const attestorSignature = web3.eth.sign(unsignedLoan.attestor, loanHash)
    unsignedLoan.signature = {
      r: '0x' + attestorSignature.slice(2, 66),
      s: '0x' + attestorSignature.slice(66, 130),
      v: '0x' + attestorSignature.slice(130, 132)
    }

    const signedLoan = unsignedLoan;
    return signedLoan;
  }

  async generateAuctionStateLoan(loan, auctionLength, reviewPeriod) {
    const signedLoan = LoanFactory.generateSignedLoan(loan);
    await this.contract.createLoan(
      signedLoan.uuid,
      signedLoan.borrower,
      signedLoan.principal,
      signedLoan.terms,
      signedLoan.attestor,
      signedLoan.attestorFee,
      signedLoan.defaultRisk,
      signedLoan.signature.r,
      signedLoan.signature.s,
      signedLoan.signature.v,
      auctionLength,
      reviewPeriod
    );
  }

  async generateReviewStateLoan(loan, bids) {
    await this.generateAuctionStateLoan(loan, bids.length, 100);
    for (let i = 0; i < bids.length; i++) {
      await this.contract.bid(
        loan.uuid,
        bids[i].bidder,
        web3.toWei(bids[i].minInterestRate, 'ether'),
        { value: web3.toWei(bids[i].amount, 'ether') }
      )
    }
  }

  async generateAcceptedStateLoan(loan, bids, acceptedBids) {
    await this.generateReviewStateLoan(loan, bids);
    await this.contract.acceptBids(
      loan.uuid,
      acceptedBids.map((bid) => { return bid.bidder }),
      acceptedBids.map((bid) => { return web3.toWei(bid.amount, 'ether') })
    )
  }

  async generateRejectedStateLoan(loan, bids) {
    await this.generateReviewStateLoan(loan, bids);
    await this.contract.rejectBids(loan.uuid);
  }

  static _generateTermsByteString(terms) {
    let version = util.stripZeroEx(terms.version);
    let periodType = util.stripZeroEx(web3.toHex(terms.periodType))
    let periodLength = util.stripZeroEx(web3.toHex(terms.periodLength))
    let termLength = util.stripZeroEx(web3.toHex(terms.termLength))
    let compounded = util.stripZeroEx(web3.toHex(terms.compounded))

    version = web3._extend.utils.padLeft(version, 64) // bytes32
    periodType = web3._extend.utils.padLeft(periodType, 2) // uint8
    periodLength = web3._extend.utils.padLeft(periodLength, 64) // uint256
    termLength = web3._extend.utils.padLeft(termLength, 64) // uint256
    compounded = web3._extend.utils.padLeft(compounded, 2) // uint8

    return '0x' + version + periodType + periodLength + termLength + compounded;
  }
}

module.exports = LoanFactory
