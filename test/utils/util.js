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

  getBalance(address) {
    return new Promise(function(resolve, reject) {
      this.web3.eth.getBalance(address, (err, balance) => {
        if (err) {
          reject(err)
        } else {
          resolve(balance);
        }
      })
    }.bind(this));
  }

  async pause(seconds) {
    return new Promise(function(resolve, reject) {
      setTimeout(() => { resolve() }, seconds*1000);
    });
  }
}

module.exports = Util;
