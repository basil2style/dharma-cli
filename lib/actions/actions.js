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
