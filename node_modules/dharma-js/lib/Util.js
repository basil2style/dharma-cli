import _ from 'lodash';
import promisify from 'es6-promisify';

class Util {
  static stripZeroEx(data) {
    if (data.slice(0, 2) === '0x')
      return data.slice(2)
    else
      return data;
  }

  static async isTestRpc(web3) {
    const getNodeVersion = promisify(web3.version.getNode);
    const nodeVersion = await getNodeVersion();

    return _.includes(nodeVersion, 'TestRPC');
  }

  static async getLatestBlockNumber(web3) {
    return new Promise(function(accept, reject) {
      web3.eth.getBlockNumber(function(err, blockNumber) {
        if (err) reject(err);
        else {
          accept(blockNumber)
        }
      })
    });
  }

  static async getBlock(web3, blockNumber) {
    return new Promise(function(accept, reject) {
      web3.eth.getBlock(blockNumber, function(err, block) {
        if (err) reject(err);
        else {
          accept(block)
        }
      })
    });
  }
}

module.exports = Util;
