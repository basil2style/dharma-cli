import prompt from 'prompt';
import Web3 from 'web3';
import Dharma from 'dharma';
import Wallet from './Wallet';
import ProviderEngine from 'web3-provider-engine';
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc.js';
import Borrower from './Borrower';
import commander from 'commander';
import inquirer from 'inquirer';
import {WalletFlow} from './cli/prompts';
import {Spinner} from 'cli-spinner';

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
      .command('borrow <amount>', "request an instant loan in Ether.")
      .parse(args);
  }

  static async borrow(args) {
    let amount;
    commander
      .version('0.1.0')
      .usage('borrow [options] <amount>')
      .option('-u, --unit [unit]',
        'Specifies the unit of ether (e.g. wei, finney, szabo)',
        /^(wei|kwei|ada|mwei|babbage|gwei|shannon|szabo|finney|ether|kether|grand|einstein|mether|gether|tether|small)$/i,
        'ether')
      .arguments('<amount>')
      .action((_amount) => {
        amount = _amount;
      })

    commander.parse(args);

    if (!amount) {
      commander.help()
    }

    const cli = await CLI.init();
    await cli.borrowFlow(amount, commander.unit);
  }

  static async init(amount, unit) {
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
      rpcUrl: 'http://localhost:8546',
    }))
    engine.start();

    const dharma = new Dharma(web3);

    return new CLI(dharma);
  }

  static async loadWalletFlow() {
    const choice = await inquirer.prompt([WalletFlow.unlockOptions]);

    let wallet;
    if (choice.unlockChoice === 'Enter passphrase') {
      while (true) {
        const answer = await inquirer.prompt([WalletFlow.enterPassphrase]);

        try {
          wallet = await Wallet.getWallet(answer.passphrase);
          console.log("Wallet unlocked!");
          break;
        } catch (err) {
          console.error("Incorrect passphrase.  Please try again.");
        }
      }
    } else {
      while (true) {
        let {mnemonic} = await inquirer.prompt([WalletFlow.enterMnemonic]);

        try {
          wallet = await Wallet.recoverWallet(mnemonic);
          console.log("Wallet has been recovered!");
          break;
        } catch (err) {
          console.log(err)
          console.error("Incorrect seed phrase.  Please try again.");
        }
      }

      const passphrase = await this.passphraseFlow();
      await wallet.save(passphrase);

      console.log("Wallet saved and re-encrypted with new passphrase.")
    }

    return wallet;
  }

  static async passphraseFlow() {
    let passphrase;
    while (!passphrase) {
      let passphraseAnswers = await inquirer.prompt([
        WalletFlow.choosePassphrase, WalletFlow.confirmPassphrase
      ])

      if (passphraseAnswers.passphrase !== passphraseAnswers.passphraseConfirmation) {
        console.error("Confirmation does not match passphrase, try again.");
      } else {
        passphrase = passphraseAnswers.passphrase;
      }
    }

    return passphrase;
  }

  static async generateWalletFlow() {
    await inquirer.prompt([WalletFlow.start])

    const passphrase = await this.passphraseFlow();

    const wallet = await Wallet.generate(passphrase);

    const address = wallet.getAddress();
    const mnemonic = wallet.getMnemonic();

    console.log("You've generated a local wallet with the following address: " + address);
    console.log("Please write down the following recovery phrase and store it in " +
      "a safe place -- if you forget your passphrase, you will not be able to " +
      "recover your funds without the recovery phrase");
    console.log(mnemonic);

    return wallet;
  }

  async borrowFlow(amount, unit) {
    let loan;
    try {
      const address = this.dharma.web3.eth.defaultAccount;
      loan = await this.borrower.requestAttestion(address, amount);
    }

    const loader = new Spinner('Requesting attestation from Dharma Labs Inc.')
    loader.setSpinnerString(18);
    loader.start();




  }
}

module.exports = CLI;
