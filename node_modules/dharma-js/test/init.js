const Util = require('./util.js');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8546'))
const util = new Util(web3);

global.ACCOUNTS = []

before(function(done) {
  web3.eth.getAccounts(function(err, result) {
    if (err) {
      done(err);
    } else {
      global.ACCOUNTS = result;
      web3.eth.defaultAccount = global.ACCOUNTS[0];
      done()
    }
  })
})

module.exports = {web3, util};
