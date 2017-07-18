'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addLoan = addLoan;
exports.addBid = addBid;
exports.displayTerms = displayTerms;
exports.initState = initState;
exports.log = log;
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