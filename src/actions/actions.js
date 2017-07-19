'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addInvestment = addInvestment;
exports.displayTerms = displayTerms;
exports.initState = initState;
exports.log = log;
exports.updateTotalCash = updateTotalCash;
exports.updatePortfolioSummary = updatePortfolioSummary;
var ADD_INVESTMENT = exports.ADD_INVESTMENT = 'ADD_INVESTMENT';
function addInvestment(investment) {

  var investmentJson = void 0;
  try {
    investmentJson = investment.toJson();
  } catch (err) {
    console.log(err);
  }

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
async function initState(portfolio) {
  var summary = await portfolio.getSummary();
  var portfolioJson = portfolio.toJson();
  return {
    type: INIT_STATE,
    summary: summary,
    portfolio: portfolioJson
  };
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

var UPDATE_PORTFOLIO_SUMMARY = exports.UPDATE_PORTFOLIO_SUMMARY = 'UPDATE_PORTFOLIO_SUMMARY';
function updatePortfolioSummary(summary) {
  return {
    type: UPDATE_PORTFOLIO_SUMMARY,
    principalOutstanding: summary.principalOutstanding,
    interestEarned: summary.interestEarned,
    totalCash: summary.totalCash,
    defaultedValue: summary.defaultedValue
  };
}