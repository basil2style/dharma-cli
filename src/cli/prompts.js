'use strict';

module.exports = {
  WalletFlow: {
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
  }
};