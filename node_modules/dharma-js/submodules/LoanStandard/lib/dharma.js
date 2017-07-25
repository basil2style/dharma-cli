function Dharma(_web3) {
  this.web3 = _web3;
}

Dharma.prototype.getLoans = function(path, startBlockNumber, endBlockNumber) {
  return new Promise(function(accept, reject) {
    loan = require(path);
    loan_binary = loan.unlinked_binary;
    loanAddresses = [];

    if (endBlockNumber == null) {
      endBlockNumber = this.web3.eth.blockNumber;
      console.log("Using endBlockNumber: " + endBlockNumber);
    }
    if (startBlockNumber == null) {
      startBlockNumber = Math.max(endBlockNumber - 100, 0);
      console.log("Using startBlockNumber: " + startBlockNumber);
    }

    for (var i = startBlockNumber; i <= endBlockNumber; i++) {
      if (i % 1000 == 0) {
        console.log("Searching block " + i);
      }
      var block = this.web3.eth.getBlock(i, true);
      if (block != null && block.transactions != null) {
        block.transactions.forEach( function(e) {
            if (e.to == '0x0' && e.input.startsWith(loan_binary)) {
              receipt = this.web3.eth.getTransactionReceipt(e.hash);
              loanAddresses.append(receipt.contractAddress);
            }
        });
      }
    }

    accept(loanAddresses);
  });
}

module.exports = Dharma;
