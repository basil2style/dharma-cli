var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8546'));

function test() {
  console.log("this should work");
}

new Promise(function(accept, reject) {
  var getBlockEvent = web3.eth.filter('latest', function(blockNumber) {
    test();
    getBlockEvent.stopWatching();
    test();
  })
  accept();
})
