import Util from '../Util.js';
import LoanContract from '../contract_wrappers/LoanContract.js';

class AuctionCompleted {
  constructor(web3, auctionPeriodEndBlock) {
    this.web3 = web3;
    this.auctionPeriodEndBlock = auctionPeriodEndBlock;
    this.blockListener = null;
    this.listening = false;
  }

  watch(callback) {
    const web3 = this.web3;
    const auctionPeriodEndBlock = this.auctionPeriodEndBlock

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

          if (auctionPeriodEndBlock.lt(blockNumber)) {
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
      throw new Error('AuctionCompleted event requires UUID to follow.');

    const auctionPeriodEndBlock =
      await contract.getAuctionEndBlock.call(options.uuid);

    if (auctionPeriodEndBlock.equals(0))
      throw new Error('AuctionCompleted listener can only be activated once loan' +
        'has been broadcasted');

    const auctionCompletedEvent =
      new AuctionCompleted(web3, auctionPeriodEndBlock);

    if (callback) {
      auctionCompletedEvent.watch(callback)
    } else {
      return auctionCompletedEvent;
    }
  }
}

module.exports = AuctionCompleted;
