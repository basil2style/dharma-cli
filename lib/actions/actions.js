export const ADD_INVESTMENT = 'ADD_INVESTMENT';
export function addInvestment(investment) {
  let investmentJson;
  try {
    investmentJson = investment.toJson();
  } catch (err) {
    console.log(err);
  }

  return {
    type: ADD_INVESTMENT,
    investment: investmentJson
  }
}

export const UPDATE_INVESTMENT = 'UPDATE_INVESTMENT';
export function updateInvestment(investment) {
  let investmentJson;
  try {
    investmentJson = investment.toJson();
  } catch (err) {
    console.log(err);
  }

  return {
    type: UPDATE_INVESTMENT,
    investment: investmentJson
  }
}

export const DISPLAY_TERMS = 'DISPLAY_TERMS';
export function displayTerms(index) {
  let action = {
    index: index,
    type: DISPLAY_TERMS
  }
  return action;
}

export const INIT_STATE = 'INIT_STATE';
export async function initState(portfolio) {
  const summary = await portfolio.getSummary();
  const portfolioJson = portfolio.toJson();
  return {
    type: INIT_STATE,
    summary: summary,
    portfolio: portfolioJson
  }
}

export const LOG_MESSAGE = 'LOG_MESSAGE';
export function log(type, message) {
  let startTag;
  let endTag;
  switch (type) {
    case 'info':
      startTag = "{cyan-fg}";
      endTag = "{/cyan-fg}";
      break;
    case 'success':
      startTag = "{green-fg}";
      endTag = "{/green-fg}";
      break;
    case 'error':
      startTag = "{red-fg}";
      endTag = "{/red-fg}";
      break;
    default:
      startTag = "{white-fg}";
      endTag = "{/white-fg}";
      break;
  }

  return {
    message: startTag + message + endTag,
    type: LOG_MESSAGE
  }
}

export const UPDATE_TOTAL_CASH = 'UPDATE_TOTAL_CASH';
export function updateTotalCash(totalCash) {
  return  {
    type: UPDATE_TOTAL_CASH,
    totalCash: totalCash
  }
}

export const UPDATE_PORTFOLIO_SUMMARY = 'UPDATE_PORTFOLIO_SUMMARY';
export function updatePortfolioSummary(summary) {
  return  {
    type: UPDATE_PORTFOLIO_SUMMARY,
    principalOutstanding: summary.principalOutstanding,
    principalCollected: summary.principalCollected,
    interestCollected: summary.interestCollected,
    totalCash: summary.totalCash,
    defaultedValue: summary.defaultedValue
  }
}
