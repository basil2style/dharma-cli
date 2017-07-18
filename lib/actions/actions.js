export const ADD_LOAN = 'ADD_LOAN';
export function addLoan(loan) {
  let loanJson = loan.toJson();
  loanJson.type = ADD_LOAN;
  return loanJson;
}

export const ADD_BID = 'ADD_BID';
export function addBid(loan, bid) {
  let loanJson = loan.toJson();
  loanJson.type = ADD_BID;
  loanJson.bid = bid;
  return loanJson;
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
export function initState(portfolio) {
  let portfolioJson =  {
    portfolio: portfolio.toJson()
  }
  portfolioJson.type = INIT_STATE;
  return portfolioJson;
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
