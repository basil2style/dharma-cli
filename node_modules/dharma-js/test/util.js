const expect = require('expect.js');

class Util {
  constructor(web3) {
    this.web3 = web3;
    this.gasPrice = web3.eth.gasPrice;
  }

  setTimeForward(timeDiff) {
    return new Promise(function(accept, reject) {
      this.web3.currentProvider.sendAsync({
        method: "evm_increaseTime",
        params: [timeDiff],
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

  getGasCosts(result) {
    return new Promise(function(accept, reject) {
      if (typeof result.tx !== 'undefined') {
        accept(this.gasPrice.times(result.receipt.gasUsed));
      } else {
        this.web3.eth.getTransactionReceipt(result, function(err, tx) {
          if (err) reject(err)
          else {
            const gasCost = this.gasPrice.times(tx.gasUsed);
            accept(gasCost);
          }
        }.bind(this))
      }
    }.bind(this));
  }

  assertThrowMessage(err) {
    expect(err.toString().indexOf('invalid JUMP') > -1 ||
      err.toString().indexOf('out of gas') > -1 ||
      err.toString().indexOf('invalid opcode') > -1).to.be(true);
  }

  assertEventEquality(log, expectedLog) {
    expect(log.event).to.be(expectedLog.event);
    Object.keys(expectedLog.args).forEach(function(key, index) {
      expect(log.args[key].toString()).to.be(expectedLog.args[key].toString());
    });
  }

  async getLatestBlockNumber(web3) {
    return new Promise(function(accept, reject) {
      web3.eth.getBlock('latest', function(err, block) {
        if (err) reject(err);
        else {
          accept(block.number)
        }
      })
    });
  }

  async pause(seconds) {
    return new Promise(function(resolve, reject) {
      setTimeout(() => { resolve() }, seconds*1000);
    });
  }
}

module.exports = Util;
