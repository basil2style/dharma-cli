const portfolioSummary = (state = [], action) => {
  let summary;
  switch (action.type) {
    case 'UPDATE_PORTFOLIO_SUMMARY':
      summary = {
        principalOutstanding: action.principalOutstanding,
        principalCollected: action.principalCollected,
        interestCollected: action.interestCollected,
        totalCash: action.totalCash,
        defaultedValue: action.defaultedValue
      };
      summary.totalValue = summary.principalOutstanding
                            .plus(summary.totalCash)
                            .minus(summary.defaultedValue);
      summary.cashDeposited = summary.totalCash
                                .minus(summary.interestCollected)
                                .minus(summary.principalCollected)
      return summary;
      break;
    case 'INIT_STATE':
      summary = action.summary;
      summary.totalValue = summary.principalOutstanding
                            .plus(summary.totalCash)
                            .minus(summary.defaultedValue);
      summary.cashDeposited = summary.totalCash
                                .minus(summary.interestCollected)
                                .minus(summary.principalCollected)
      return summary;
      break;
    case 'UPDATE_TOTAL_CASH':
      // state.totalCash = action.totalCash;
      // state.totalValue = state.principalOutstanding
      //                       .plus(state.interestEarned)
      //                       .plus(state.totalCash)
      //                       .minus(state.defaultedValue);
      return state;
    default:
      return state;
  }
}

export default portfolioSummary;
