const loans = (state = [], action) => {
  switch (action.type) {
    case 'INIT_STATE':
      const portfolio = action.portfolio;
      return Object.keys(portfolio).map((uuid) => {
        const investment = portfolio[uuid];
        const loan = investment.loan;
        return {
          uuid: loan.uuid,
          borrower: loan.borrower,
          principal: loan.principal,
          interestRate: loan.interestRate,
          terms: {
            version: loan.terms.version,
            periodType: loan.terms.periodType,
            periodLength: loan.terms.periodLength,
            termLength: loan.terms.termLength,
            compounded: loan.terms.compounded
          },
          attestor: loan.attestor,
          attestorFee: loan.attestorFee,
          defaultRisk: loan.defaultRisk,
          termBeginTimestamp: loan.termBeginTimestamp
        }
      })
      break;
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
          termBeginTimestamp: action.termBeginTimestamp
        }
      ]
      break;
    default:
      return state
  }
}

export default loans
