import Util from '../Util.js';
import LoanContract from '../contract_wrappers/LoanContract.js';

class ReviewPeriodCompleted {
  constructor(web3, reviewPeriodEndBlock) {
    this.web3 = web3;
    this.reviewPeriodEndBlock = reviewPeriodEndBlock;
    this.blockListener = null;
    this.listening = false;
  }

  watch(callback) {
    const web3 = this.web3;
    const reviewPeriodEndBlock = this.reviewPeriodEndBlock

    this.listening = true;

    this.blockListener = this.web3.eth.filter('latest');
    this.blockListener.watch(function (err, result) {
      if (err) {
        this.listening = false;
        callback(err, null);
      } else {
        web3.eth.getBlockNumber(function (err, blockNumber) {
          if (!this.listening)
            return;

          if (reviewPeriodEndBlock.lt(blockNumber)) {
            this.listening = false;
            callback(null, blockNumber);
          }
        }.bind(this));
      }
    }.bind(this))
  }

  stopWatching(callback) {
    this.listening = false;
    this.blockListener.stopWatching(callback)
  }

  static async create(web3, options, callback) {
    const contract = await LoanContract.instantiate(web3);

    if (options.uuid === 'undefined')
      throw new Error('ReviewPeriodCompleted event requires UUID to follow.');

    const reviewPeriodEndBlock =
      await contract.getReviewPeriodEndBlock.call(options.uuid);

    if (reviewPeriodEndBlock.equals(0))
      throw new Error('AuctionCompleted listener can only be activated once loan' +
        'has been broadcasted');

    const reviewPeriodCompletedEvent =
      new ReviewPeriodCompleted(web3, reviewPeriodEndBlock);

    if (callback) {
      reviewPeriodCompletedEvent.watch(callback)
    } else {
      return reviewPeriodCompletedEvent;
    }
  }
}

module.exports = ReviewPeriodCompleted;
