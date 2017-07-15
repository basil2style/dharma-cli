'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Util = function () {
  function Util() {
    _classCallCheck(this, Util);
  }

  _createClass(Util, null, [{
    key: 'stripZeroEx',
    value: function stripZeroEx(data) {
      if (data.slice(0, 2) === '0x') return data.slice(2);else return data;
    }
  }, {
    key: 'transactionMined',
    value: async function transactionMined(web3, txHash) {
      return new Promise(function (resolve, reject) {
        var filter = web3.eth.filter('latest');
        filter.watch(function (err, block) {
          if (err) {
            reject(err);
          } else {
            web3.eth.getTransaction(txHash, function (err, tx) {
              if (tx.blockNumber) {
                filter.stopWatching(function () {
                  resolve(tx);
                });
              }
            });;
          }
        });
      });
    }
  }, {
    key: 'getBalance',
    value: async function getBalance(web3, address) {
      return new Promise(function (resolve, reject) {
        web3.eth.getBalance(address, function (err, balance) {
          if (err) {
            reject(err);
          } else {
            resolve(balance);
          }
        });
      });
    }
  }]);

  return Util;
}();

module.exports = Util;