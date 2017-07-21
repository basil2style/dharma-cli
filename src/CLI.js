'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _web = require('web3');

var _web2 = _interopRequireDefault(_web);

var _dharma = require('dharma');

var _dharma2 = _interopRequireDefault(_dharma);

var _Wallet = require('./Wallet');

var _Wallet2 = _interopRequireDefault(_Wallet);

var _web3ProviderEngine = require('web3-provider-engine');

var _web3ProviderEngine2 = _interopRequireDefault(_web3ProviderEngine);

var _rpc = require('web3-provider-engine/subproviders/rpc.js');

var _rpc2 = _interopRequireDefault(_rpc);

var _web3 = require('web3-provider-engine/subproviders/web3.js');

var _web4 = _interopRequireDefault(_web3);

var _Borrower = require('./Borrower');

var _Borrower2 = _interopRequireDefault(_Borrower);

var _Investor = require('./Investor');

var _Investor2 = _interopRequireDefault(_Investor);

var _Authenticate = require('./Authenticate');

var _Authenticate2 = _interopRequireDefault(_Authenticate);

var _commandLineCommands2 = require('command-line-commands');

var _commandLineCommands3 = _interopRequireDefault(_commandLineCommands2);

var _commandLineArgs = require('command-line-args');

var _commandLineArgs2 = _interopRequireDefault(_commandLineArgs);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _Util = require('./Util');

var _Util2 = _interopRequireDefault(_Util);

var _prompts = require('./cli/prompts');

var _cliSpinner = require('cli-spinner');

var _Errors = require('./Errors');

var _opn = require('opn');

var _opn2 = _interopRequireDefault(_opn);

var _LoanDecorator = require('./decorators/LoanDecorator');

var _LoanDecorator2 = _interopRequireDefault(_LoanDecorator);

var _InvestorApp = require('./components/InvestorApp');

var _InvestorApp2 = _interopRequireDefault(_InvestorApp);

var _Liabilities = require('./models/Liabilities');

var _Liabilities2 = _interopRequireDefault(_Liabilities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CLI = function () {
  function CLI(dharma, wallet) {
    _classCallCheck(this, CLI);

    this.dharma = dharma;
    this.web3 = dharma.web3;
    this.wallet = wallet;
    this.borrower = new _Borrower2.default(dharma);
  }

  _createClass(CLI, [{
    key: 'walletFlow',
    value: async function walletFlow() {
      var address = this.wallet.getAddress();
      var balance = await _Util2.default.getBalance(this.web3, address);

      console.log('Ropsten Testnet Balance: \u039E' + balance);

      var menu = await _inquirer2.default.prompt([_prompts.WalletFlow.mainMenu]);
      var loader = void 0;
      if (menu.choice === 'Send Ether') {
        var recipient = void 0;
        while (!recipient) {
          var response = await _inquirer2.default.prompt([_prompts.WalletFlow.enterRecipient]);
          if (!this.web3.isAddress(response.address)) {
            console.log("Address is not a valid Ethereum address.");
          } else {
            recipient = response.address;
          }
        }

        var amount = void 0;
        while (!amount) {
          var _response = await _inquirer2.default.prompt([_prompts.WalletFlow.enterAmount]);
          var respondedAmount = this.web3.toWei(_response.amount, 'ether');
          if (balance.lte(respondedAmount)) {
            console.log("Your balance is too low :(");
          } else {
            amount = respondedAmount;
          }
        }

        loader = new _cliSpinner.Spinner('Sending Ether to ' + recipient);
        loader.setSpinnerString(18);
        loader.start();

        this.web3.eth.sendTransaction({ from: address, to: recipient, value: amount }, function (err, result) {
          loader.stop(true);
          if (err) {
            console.error(err);
            process.exit(1);
          } else {
            console.log("Transaction successfully broadcasted!");
            console.log("Transaction: https://ropsten.etherscan.io/tx/" + result);
          }
        });
      } else if (menu.choice === 'Make Loan Repayment') {
        loader = new _cliSpinner.Spinner('Loading...');
        loader.setSpinnerString(18);
        loader.start();
        var liabilities = await _Liabilities2.default.load(this.dharma);
        loader.stop(true);

        var options = [];
        for (var _uuid in liabilities.loans) {
          var _loan = liabilities.loans[_uuid];
          var _decorator = new _LoanDecorator2.default(_loan);
          var _currentBalanceOwed = await _decorator.currentBalanceOwed();
          var loanStr = _uuid + " -- Principal: " + _decorator.principal() + " -- Current Balance Owed: " + _currentBalanceOwed;
          options.push(loanStr);
        }

        var _response2 = await _inquirer2.default.prompt([_prompts.WalletFlow.chooseLoan(options)]);
        var uuid = _response2.choice.substr(0, 66);
        var loan = liabilities.loans[uuid];
        var decorator = new _LoanDecorator2.default(loan);
        var currentBalanceOwed = await decorator.currentBalanceOwed();

        var _amount = void 0;
        while (!_amount) {
          var amountResponded = void 0;
          _response2 = await _inquirer2.default.prompt([_prompts.WalletFlow.chooseAmount(currentBalanceOwed)]);
          if (_response2.choice === 'Other') {
            var _response3 = await _inquirer2.default.prompt([_prompts.WalletFlow.enterAmount]);
            amountResponded = this.web3.toWei(_response3.amount, 'ether');
          } else {
            amountResponded = await loan.servicing.currentBalanceOwed();
          }

          if (balance.lte(amountResponded)) {
            console.log("Your balance is too low :(");
          } else {
            _amount = amountResponded;
          }
        }

        loader = new _cliSpinner.Spinner('Sending repayment to loan ' + uuid);
        loader.setSpinnerString(18);
        loader.start();

        await loan.repay(_amount, { from: address });

        loader.stop(true);
        console.log("Repayment successful.");

        process.exit(0);
      }
    }
  }, {
    key: 'borrowFlow',
    value: async function borrowFlow(amount, unit) {
      var address = this.wallet.getAddress();

      var loan = void 0;
      var stipendReceiptHash = void 0;

      var loader = new _cliSpinner.Spinner('Requesting attestation from Dharma Labs Inc.');
      loader.setSpinnerString(18);
      loader.start();

      // Request attestation from the Risk Assessment Attestor (i.e. Dharma)
      try {
        loan = await this.borrower.requestAttestation(address, amount);
      } catch (err) {
        loader.stop();
        if (err.type === 'AuthenticationError') {
          var answer = await _inquirer2.default.prompt([_prompts.AuthenticateFlow.start]);
          if (answer.confirmStart) {
            await (0, _opn2.default)('http://localhost:8080/api/authenticate', { wait: false });
          }
        } else {
          throw err;
        }
        return;
      }

      // If borrower's balance is too low to deploy loan request, request deployment
      // stipend from RAA.
      var hasMinBalance = await this.borrower.hasMinBalanceRequired(address);
      if (!hasMinBalance) {
        loader.setSpinnerTitle("Requesting deployment stipend from Dharma Labs Inc.");
        try {
          var txHash = await this.borrower.requestDeploymentStipend(address);
          var tx = await _Util2.default.transactionMined(this.web3, txHash);
        } catch (err) {
          console.error(err.stack);
        }
      }

      loader.setSpinnerTitle("Deploying loan request.");

      var onAuctionStart = function onAuctionStart(err, result) {
        loader.setSpinnerTitle("Loan request deployed. Investors are bidding on your request.");
      };

      var onReviewStart = this.loanReviewFlow(loan, loader);

      try {
        await this.borrower.broadcastLoanRequest(loan, onAuctionStart, onReviewStart);
      } catch (err) {
        loader.stop(true);
        console.log(err);
        process.exit();
      }
    }
  }, {
    key: 'loanReviewFlow',
    value: function loanReviewFlow(loan, loader) {
      var _this = this;

      return async function (err, bestBidSet) {
        loader.stop(true);

        if (err) {
          switch (err.error) {
            case 'PRINCIPAL_UNMET':
              console.error("Your loan request did not attract enough bidders " + "from the Dharma Loan Network.  Try again in 5 minutes.");
              break;
            default:
              console.error(err);
              break;
          }

          process.exit();
        } else {

          loan.interestRate = bestBidSet.interestRate;
          var decorator = new _LoanDecorator2.default(loan);

          console.log("Your loan request of " + decorator.principal() + " ether has been" + " approved at a " + decorator.interestRate() + " simple interest rate.");
          var answer = await _inquirer2.default.prompt([_prompts.BorrowFlow.reviewLoanTerms]);

          if (answer.choice === 'Accept') {
            loader.setSpinnerTitle("Accepting loan terms");
            loader.start();

            await _this.borrower.acceptLoanTerms(loan, bestBidSet.bids);
            loader.stop(true);

            console.log("Your loan has been funded and " + decorator.principal() + " ether has been transferred to " + "address " + loan.borrower);

            process.exit();
          } else {
            loader.setSpinnerTitle("Rejecting loan terms");
            loader.start();

            await loan.rejectBids();
            loader.stop(true);

            console.log("You've rejected the loan terms presented to you.");

            process.exit();
          }
        }
      };
    }
  }, {
    key: 'investFlow',
    value: async function investFlow(decisionEnginePath) {
      try {
        var investor = await _Investor2.default.fromPath(this.dharma, this.wallet, decisionEnginePath);
        var app = new _InvestorApp2.default(investor);
        await app.start();
      } catch (err) {
        console.error(err);
        process.exit();
      }
    }
  }], [{
    key: 'authenticate',
    value: async function authenticate(args) {
      var optionDefinitions = [{ name: 'authKey', alias: 'a', defaultOption: true, type: String }];

      var params = (0, _commandLineArgs2.default)(optionDefinitions, {
        argv: args
      });

      var authenticate = new _Authenticate2.default();

      try {
        await authenticate.setAuthKey(params.authKey);
        console.log("Your account is now authenticated!  You may broadcast requests " + 'to the Dharma Loan Network');
      } catch (err) {
        console.log(err);
        console.error("Failed to write to local authentication token store.");
      }
    }
  }, {
    key: 'entry',
    value: async function entry(args) {
      var validCommands = [null, 'borrow', 'authenticate', 'invest', 'wallet'];

      var _commandLineCommands = (0, _commandLineCommands3.default)(validCommands),
          command = _commandLineCommands.command,
          argv = _commandLineCommands.argv;

      switch (command) {
        case "borrow":
          await CLI.borrow(argv);
          break;
        case "authenticate":
          await CLI.authenticate(argv);
          break;
        case "invest":
          await CLI.invest(argv);
          break;
        case "wallet":
          await CLI.wallet(argv);
          break;
        default:
          // do something
          break;
      }
    }
  }, {
    key: 'borrow',
    value: async function borrow(args) {
      var optionDefinitions = [{ name: 'unit', alias: 'u', defaultValue: 'ether', type: String }, { name: 'amount', alias: 'a', defaultOption: true, type: Number }];

      var params = (0, _commandLineArgs2.default)(optionDefinitions, {
        argv: args
      });

      var cli = await CLI.init();
      await cli.borrowFlow(params.amount, params.unit);
    }
  }, {
    key: 'invest',
    value: async function invest(args) {
      var optionDefinitions = [{ name: 'engine', alias: 'e', defaultOption: true, type: String }];

      var params = (0, _commandLineArgs2.default)(optionDefinitions, {
        argv: args
      });

      var cli = await CLI.init();
      await cli.investFlow(params.engine);
    }
  }, {
    key: 'wallet',
    value: async function wallet(args) {
      var cli = await CLI.init();
      await cli.walletFlow();
    }
  }, {
    key: 'init',
    value: async function init(walletStoreFile) {
      var walletExists = await _Wallet2.default.walletExists(walletStoreFile);
      var wallet = void 0;
      if (walletExists) {
        wallet = await CLI.loadWalletFlow(walletStoreFile);
      } else {
        wallet = await CLI.generateWalletFlow(walletStoreFile);
      }

      var engine = new _web3ProviderEngine2.default();
      var web3 = new _web2.default(engine);

      engine.addProvider(wallet.getSubprovider());
      engine.addProvider(new _web4.default(new _web2.default.providers.HttpProvider('http://localhost:8546')));
      engine.start();

      var dharma = new _dharma2.default(web3);

      return new CLI(dharma, wallet);
    }
  }, {
    key: 'loadWalletFlow',
    value: async function loadWalletFlow(walletStoreFile) {
      var choice = await _inquirer2.default.prompt([_prompts.LoadWalletFlow.unlockOptions]);

      var wallet = void 0;
      if (choice.unlockChoice === 'Enter passphrase') {
        while (true) {
          var answer = await _inquirer2.default.prompt([_prompts.LoadWalletFlow.enterPassphrase]);

          try {
            wallet = await _Wallet2.default.getWallet(answer.passphrase, walletStoreFile);
            console.log("Wallet unlocked!");
            console.log("Testnet Address: " + wallet.getAddress());

            break;
          } catch (err) {
            console.error("Incorrect passphrase.  Please try again.");
          }
        }
      } else {
        while (true) {
          var _ref = await _inquirer2.default.prompt([_prompts.LoadWalletFlow.enterMnemonic]),
              mnemonic = _ref.mnemonic;

          try {
            wallet = await _Wallet2.default.recoverWallet(mnemonic, walletStoreFile);
            console.log("Wallet has been recovered!");
            break;
          } catch (err) {
            console.log(err);
            console.error("Incorrect seed phrase.  Please try again.");
          }
        }

        var passphrase = await this.passphraseFlow();
        await wallet.save(passphrase);

        console.log("Wallet saved and re-encrypted with new passphrase.");
      }

      return wallet;
    }
  }, {
    key: 'passphraseFlow',
    value: async function passphraseFlow() {
      var passphrase = void 0;
      while (!passphrase) {
        var passphraseAnswers = await _inquirer2.default.prompt([_prompts.LoadWalletFlow.choosePassphrase, _prompts.LoadWalletFlow.confirmPassphrase]);

        if (passphraseAnswers.passphrase !== passphraseAnswers.passphraseConfirmation) {
          console.error("Confirmation does not match passphrase, try again.");
        } else {
          passphrase = passphraseAnswers.passphrase;
        }
      }

      return passphrase;
    }
  }, {
    key: 'generateWalletFlow',
    value: async function generateWalletFlow(walletStoreFile) {
      await _inquirer2.default.prompt([_prompts.LoadWalletFlow.start]);

      var passphrase = await this.passphraseFlow();

      var wallet = await _Wallet2.default.generate(passphrase, walletStoreFile);

      var address = wallet.getAddress();
      var mnemonic = wallet.getMnemonic();

      console.log("You've generated a local wallet with the following address: " + address);
      console.log("Please write down the following recovery phrase and store it in " + "a safe place -- if you forget your passphrase, you will not be able to " + "recover your funds without the recovery phrase");
      console.log(mnemonic);

      return wallet;
    }
  }]);

  return CLI;
}();

module.exports = CLI;