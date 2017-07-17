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

export const INIT_STATE = 'INIT_STATE';
export function initState(portfolio) {
  let portfolioJson =  {
    portfolio: portfolio.toJson()
  }
  portfolioJson.type = INIT_STATE;
  return portfolioJson;
}
