'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addInvestment = addInvestment;
exports.displayTerms = displayTerms;
exports.initState = initState;
exports.log = log;
exports.updateTotalCash = updateTotalCash;
var ADD_INVESTMENT = exports.ADD_INVESTMENT = 'ADD_LOAN';
function addInvestment(investment) {
  var investmentJson = investment.toJson();
  return {
    type: ADD_INVESTMENT,
    investment: investmentJson
  };
}
//
// export const ADD_BID = 'ADD_BID';
// export function addBid(loan, bid) {
//   let loanJson = loan.toJson();
//   loanJson.type = ADD_BID;
//   loanJson.bid = bid;
//   return loanJson;
// }

var DISPLAY_TERMS = exports.DISPLAY_TERMS = 'DISPLAY_TERMS';
function displayTerms(index) {
  var action = {
    index: index,
    type: DISPLAY_TERMS
  };
  return action;
}

var INIT_STATE = exports.INIT_STATE = 'INIT_STATE';
function initState(portfolio) {
  var portfolioJson = {
    portfolio: portfolio.toJson()
  };
  portfolioJson.type = INIT_STATE;
  return portfolioJson;
}

var LOG_MESSAGE = exports.LOG_MESSAGE = 'LOG_MESSAGE';
function log(type, message) {
  var startTag = void 0;
  var endTag = void 0;
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
  };
}

var UPDATE_TOTAL_CASH = exports.UPDATE_TOTAL_CASH = 'UPDATE_TOTAL_CASH';
function updateTotalCash(totalCash) {
  return {
    type: UPDATE_TOTAL_CASH,
    totalCash: totalCash
  };
}