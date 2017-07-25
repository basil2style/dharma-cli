module.exports = {
  LoanCreated(params) {
    return {
      event: 'LoanCreated',
      args: {
        uuid: params.uuid,
        borrower: params.borrower,
        attestor: params.attestor,
        blockNumber: params.blockNumber
      }
    }
  },

  LoanTermBegin(params) {
    return {
      event: 'LoanTermBegin',
      args: {
        uuid: params.uuid,
        borrower: params.borrower,
        blockNumber: params.blockNumber
      }
    }
  },

  LoanBidsRejected(params) {
    return {
      event: 'LoanBidsRejected',
      args: {
        uuid: params.uuid,
        borrower: params.borrower,
        blockNumber: params.blockNumber
      }
    }
  },

  PeriodicRepayment(params) {
    return {
      event: 'PeriodicRepayment',
      args: {
        uuid: params.uuid,
        from: params.from,
        value: params.value,
        blockNumber: params.blockNumber
      }
    }
  },

  ValueRedeemed(params) {
    return {
      event: 'ValueRedeemed',
      args: {
        uuid: params.uuid,
        investor: params.investor,
        recipient: params.recipient,
        value: params.value,
        blockNumber: params.blockNumber
      }
    }
  },

  Transfer(params) {
    return {
      event: 'Transfer',
      args: {
        uuid: params.uuid,
        from: params.from,
        to: params.to,
        value: params.value,
        blockNumber: params.blockNumber
      }
    }
  },

  Approval(params) {
    return {
      event: 'Approval',
      args: {
        uuid: params.uuid,
        owner: params.owner,
        spender: params.spender,
        value: params.value,
        blockNumber: params.blockNumber
      }
    }
  }
}
