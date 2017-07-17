const bids = (state = [], action) => {
  switch (action.type) {
    case 'ADD_BID':
      return [
        ...state,
        {
          uuid: action.uuid,
          borrower: action.borrower,
          principal: action.principal,
          terms: {
            version: action.terms.version,
            periodType: action.terms.periodType,
            periodLength: action.terms.periodLength,
            termLength: action.terms.termLength,
            compounded: action.terms.compounded
          },
          attestor: action.attestor,
          attestorFee: action.attestorFee,
          defaultRisk: action.defaultRisk,
          bid: {
            amount: action.bid.amount,
            minInterestRate: action.bid.minInterestRate
          },
          bidState: action.bidState
        }
      ]
      break;
    default:
      return state
  }
}

export default bids
