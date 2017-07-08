import os from 'os';

class Util {
  constructor(web3) {
    this.web3 = web3;
  }

  async setBlockNumberForward(blockDiff) {
    for (let i = 0; i < blockDiff; i++) {
      await this.incrementBlockNumber()
    }
  }

  incrementBlockNumber() {
    return new Promise(function(accept, reject) {
      this.web3.currentProvider.sendAsync({
        method: "evm_mine",
        jsonrpc: "2.0",
        id: Date.now()
      }, function(err, result) {
        if (err) {
          reject(err);
        } else {
          accept();
        }
      });
    }.bind(this))
  }

  static uninstallEventListener(listener) {
    setTimeout(() => {
      listener.stopWatching();
    }, 500)
  }
}

module.exports = Util;
