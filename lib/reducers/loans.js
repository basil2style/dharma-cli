const loans = (state = [], action) => {
  switch (action.type) {
    case 'ADD_LOAN':
      return [
        ...state,
        {
          uuid: action.uuid,
          borrower: action.borrower,
          principal: action.principal,
          interestRate: action.interestRate,
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
        }
      ]
      break;
    default:
      return state
  }
}

export default loans
