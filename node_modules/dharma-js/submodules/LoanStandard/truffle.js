require("babel-register");
require("babel-polyfill");

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8546,
      network_id: "*" // Match any network id
    },
    dharma: {
      host: "localhost",
      port: 8546,
      from: '0x8886e57e0484b7b5e119f8cd2dbb50e5be38d9b9',
      network_id: 40734,
      gas: 3000000
    }
  }
};
