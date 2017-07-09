import prompt from 'prompt';
import Web3 from 'web3';
import Dharma from 'dharma';
import Wallet from './Wallet';
import ProviderEngine from 'web3-provider-engine';
import Borrower from './Borrower';
import commander from 'commander';

class CLI {
  constructor(dharma) {
    this.dharma = dharma;
    this.borrower = new Borrower(dharma);
  }

  borrow(amount, address) {
    console.log("here");
  }

  static entry(args) {
    commander
      .version('0.1.0')
      .command('borrow [amount]', "request an instant loan in Ether.")
      .parse(args);
  }

  static borrow(args) {
    console.log("here");
  }

  static async init() {
    const walletExists = await Wallet.walletExists();
    let wallet;
    if (walletExists) {
      wallet = await CLI.loadWalletFlow();
    } else {
      wallet = await CLI.generateWalletFlow()
    }

    const engine = new ProviderEngine();
    const web3 = new Web3(engine);

    engine.addProvider(wallet.getSubprovider());
    engine.addProvider(new RpcSubprovider({
      rpcUrl: 'https://localhost:8546',
    }))
    engine.start();

    const dharma = new Dharma(web3);

    return new CLI(dharma);
  }
}

module.exports = CLI;
