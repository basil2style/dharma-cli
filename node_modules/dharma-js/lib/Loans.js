import Loan from './Loan.js';
import Terms from './Terms.js';
import Attestation from './Attestation.js';
import LoanContract from './contract_wrappers/LoanContract.js';
import uuidV4 from 'uuid';
import Events from './events/Events.js';
import Constants from './Constants.js';

class Loans {
  constructor(web3) {
    this.web3 = web3;
    this.events = new Events(web3);
  }

  async create(data) {
    if (!data.uuid) {
      data.uuid = this.web3.sha3(uuidV4());
    }

    return Loan.create(this.web3, data);
  }

  async get(uuid) {
    const web3 = this.web3;
    const contract = await LoanContract.instantiate(this.web3);
    const data = await contract.getData.call(uuid);

    let loanData = {
      uuid: uuid,
      borrower: data[0],
      principal: this.web3.toBigNumber(data[1]),
      terms: Terms.byteStringToJson(this.web3, data[2]),
      attestor: data[3],
      attestorFee: this.web3.toBigNumber(data[4]),
      defaultRisk: this.web3.toBigNumber(data[5])
    }

    const signature = await contract.getAttestorSignature.call(uuid);
    loanData.signature = Attestation.fromSignatureData(this.web3, signature);

    const loanCreated = await this.events.created({ uuid: uuid }, {fromBlock: 0, toBlock: 'latest'});
    const loanCreatedEvents = await new Promise((accept, reject) => {
      loanCreated.get((err, loanCreatedEvents) => {
        if (err)
          reject(err)
        else
          accept(loanCreatedEvents)
      })
    })

    const loanCreatedBlock = loanCreatedEvents[0].args.blockNumber;

    const auctionPeriodEndBlock = await contract.getAuctionEndBlock.call(uuid);
    const reviewPeriodEndBlock = await contract.getReviewPeriodEndBlock.call(uuid);

    loanData.auctionPeriodEndBlock = this.web3.toBigNumber(auctionPeriodEndBlock);
    loanData.reviewPeriodEndBlock = this.web3.toBigNumber(reviewPeriodEndBlock);

    loanData.auctionPeriodLength = auctionPeriodEndBlock.minus(loanCreatedBlock);
    loanData.reviewPeriodLength = reviewPeriodEndBlock.minus(auctionPeriodEndBlock);

    loanData.state = await contract.getState.call(uuid);
    loanData.state = loanData.state.toNumber();
    if (loanData.state == Constants.ACCEPTED_STATE) {
      loanData.interestRate = await contract.getInterestRate.call(uuid);
      const termBegin = await this.events.termBegin({ uuid: uuid }, {fromBlock: 0, toBlock: 'latest'});
      const termBeginEvents = await new Promise((resolve, reject) => {
        termBegin.get((err, termBeginEvents) => {
          if (err)
            reject(err)
          else
            resolve(termBeginEvents)
        })
      })
      loanData.termBeginBlockNumber = termBeginEvents[0].args.blockNumber;
      const block = await new Promise(function(resolve, reject) {
        web3.eth.getBlock(loanData.termBeginBlockNumber, (err, block) => {
          if (err)
            reject(err)
          else
            resolve(block);
        })
      });
      loanData.termBeginTimestamp = block.timestamp;
    }

    return Loan.create(this.web3, loanData);
  }
}

module.exports = Loans;
