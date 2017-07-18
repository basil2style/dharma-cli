'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var portfolioSummary = function portfolioSummary() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var action = arguments[1];

  var summary = void 0;
  switch (action.type) {
    case 'UPDATE_PORTFOLIO_SUMMARY':
      summary = {
        principalOutstanding: action.principalOutstanding,
        interestEarned: action.interestEarned,
        totalCash: action.totalCash,
        defaultedValue: action.defaultedValue
      };
      summary.totalValue = summary.principalOutstanding.plus(summary.interestEarned).plus(summary.totalCash).minus(summary.defaultedValue);
      return summary;
      break;
    case 'INIT_STATE':
      summary = action.summary;
      summary.totalValue = summary.principalOutstanding.plus(summary.interestEarned).plus(summary.totalCash).minus(summary.defaultedValue);
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
};

exports.default = portfolioSummary;