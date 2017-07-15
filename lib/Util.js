class Util {
  static stripZeroEx(data) {
    if (data.slice(0, 2) === '0x')
      return data.slice(2)
    else
      return data;
  }

  static async transactionMined(web3, txHash) {
    return new Promise((resolve, reject) => {
      const filter = web3.eth.filter('latest');
      filter.watch((err, block) => {
        if (err) {
          reject(err)
        } else {
          web3.eth.getTransaction(txHash, (err, tx) => {
            if (tx.blockNumber) {
              filter.stopWatching(() => {
                resolve(tx);
              })
            }
          });;
        }
      })
    });
  }

  static async getBalance(web3, address) {
    return new Promise(function(resolve, reject) {
      web3.eth.getBalance(address, (err, balance) => {
        if (err) {
          reject(err)
        } else {
          resolve(balance);
        }
      })
    });
  }
}

module.exports = Util;
