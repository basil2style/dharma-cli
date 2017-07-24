'use strict';

module.exports = {
  LoadWalletFlow: {
    start: {
      type: 'confirm',
      name: 'confirmStart',
      message: "It seems you don't have a local wallet.  Let's generate " + "an encrypted wallet."
    },

    choosePassphrase: {
      type: 'password',
      name: 'passphrase',
      message: "Please choose a secure, memorable passphrase."
    },

    confirmPassphrase: {
      type: 'password',
      name: 'passphraseConfirmation',
      message: "Confirm your passphrase"
    },

    unlockOptions: {
      type: 'list',
      name: 'unlockChoice',
      message: 'Please unlock your account:',
      choices: ['Enter passphrase', "I forgot my passphrase."]
    },

    enterPassphrase: {
      type: 'password',
      name: 'passphrase',
      message: 'Enter Passphrase:'
    },

    enterMnemonic: {
      type: 'input',
      name: 'mnemonic',
      message: 'Please enter the 12 word recovery phrase you were given when you ' + "first generated the wallet:"
    }
  },

  AuthenticateFlow: {
    start: {
      type: 'confirm',
      name: 'confirmStart',
      message: 'You need to authenticate your account in order to request ' + "credit on the Dharma Loan Network.  Let's get started."
    }
  },

  BorrowFlow: {
    reviewLoanTerms: {
      type: 'list',
      name: 'choice',
      message: 'Do you agree to these loan terms?',
      choices: ['Accept', 'Reject']
    }
  },

  WalletFlow: {
    mainMenu: {
      type: 'list',
      name: 'choice',
      message: 'Main Menu:',
      choices: ['Send Ether', 'Make Loan Repayment']
    },

    enterRecipient: {
      type: 'input',
      name: 'address',
      message: 'Enter payment recipient:'
    },

    enterAmount: {
      type: 'input',
      name: 'amount',
      message: 'How much Ether do you want to send?'
    },

    chooseLoan: function chooseLoan(options) {
      return {
        type: 'list',
        name: 'choice',
        message: 'Which loan would you like to make a repayment for?',
        choices: options
      };
    },

    chooseAmount: function chooseAmount(currentBalanceOwed) {
      return {
        type: 'list',
        name: 'choice',
        message: 'Enter repayment amount:',
        choices: ['Current Balance Owed (' + currentBalanceOwed + ')', 'Other']
      };
    }
  },

  FaucetFlow: {
    howMuch: {
      type: 'list',
      name: 'choice',
      message: 'How much ether do you need?',
      choices: ['1 ether for 1 day', '2.5 ether for 3 days', '6.25 ether for 9 days']
    }
  }
};