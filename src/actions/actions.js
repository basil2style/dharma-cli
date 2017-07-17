'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addLoan = addLoan;
exports.addBid = addBid;
var ADD_LOAN = exports.ADD_LOAN = 'ADD_LOAN';
function addLoan(loan) {
  var loanJson = loan.toJson();
  loanJson.type = ADD_LOAN;
  return loanJson;
}

var ADD_BID = exports.ADD_BID = 'ADD_BID';
function addBid(loan, bid) {
  var loanJson = loan.toJson();
  loanJson.type = ADD_BID;
  loanJson.bid = bid;
  return loanJson;
}