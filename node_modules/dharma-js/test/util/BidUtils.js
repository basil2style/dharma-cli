import Random from 'random-js';

module.exports = {
  generateTestBids(web3, bidders, minAmount, maxAmount) {
    let bids = []
    for (let i = 0; i < bidders.length; i++) {
      bids.push({
        bidder: bidders[i],
        amount: web3.toWei(Random().real(minAmount, maxAmount), 'ether'),
        minInterestRate: web3.toWei(Random().real(minAmount, maxAmount), 'ether')
      })
    }
    return bids;
  }
}
