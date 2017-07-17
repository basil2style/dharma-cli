'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var bids = function bids() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var action = arguments[1];

  switch (action.type) {
    case 'ADD_BID':
      return [].concat(_toConsumableArray(state), [{
        uuid: action.uuid,
        borrower: action.borrower,
        principal: action.principal,
        terms: {
          version: action.terms.version,
          periodType: action.terms.periodType,
          periodLength: action.terms.periodLength,
          termLength: action.terms.termLength,
          compounded: action.terms.compounded
        },
        attestor: action.attestor,
        attestorFee: action.attestorFee,
        defaultRisk: action.defaultRisk,
        bid: {
          amount: action.bid.amount,
          minInterestRate: action.bid.minInterestRate
        },
        bidState: action.bidState
      }]);
      break;
    default:
      return state;
  }
};

exports.default = bids;