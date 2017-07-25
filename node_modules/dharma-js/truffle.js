const exec = require('child_process').exec;

// var bip39 = require("bip39");
// var hdkey = require('ethereumjs-wallet/hdkey');
// var ProviderEngine = require("web3-provider-engine");
// var WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
// var Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");
// var Web3 = require("web3");
// //
// // Get our mnemonic and create an hdwallet
// var mnemonic = "alert vague pause gravity breeze position eagle boil glide coast giant planet";
// var hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));
//
// // Get the first account using the standard hd path.
// var wallet_hdpath = "m/44'/60'/0'/0";
// var wallet = hdwallet.derivePath(wallet_hdpath + "0").getWallet();
// var address = "0x" + wallet.getAddress().toString("hex");
//
//
// var providerUrl = "https://localhost:8545";
// var engine = new ProviderEngine();
// engine.addProvider(new WalletSubprovider(wallet, {}));
// engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(providerUrl)));
// engine.start(); // Required by the provider engine.

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8546,
      network_id: "*" // Match any network id
    },
    ropsten: {
      host: "localhost",
      port: 8545,
      from: '0xac7f7b63d1d6e311695693235eb3262f60fea079',
      // engine: engine,
      network_id: 3
    }
  },
  build: function(options, callback) {
     // Do something when a build is required. `options` contains these values:
     //
     // working_directory: root location of the project
     // contracts_directory: root directory of .sol files
     // destination_directory: directory where truffle expects the built assets (important for `truffle serve`)

     const solc_compile = "docker run -v " + options.working_directory + ":/DharmaLoanStandard \
       ethereum/solc:stable -o /DharmaLoanStandard/dist --overwrite --optimize --bin --abi \
       /DharmaLoanStandard/contracts/Loan.sol"

     exec(solc_compile, function(error, stdout, stderr) {
       if (error) {
         console.log(error)
       }
       callback(error);
     })
  }
};
