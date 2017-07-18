'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var investments = function investments() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var action = arguments[1];

  switch (action.type) {
    case 'INIT_STATE':
      var portfolio = action.portfolio;
      return Object.keys(portfolio).map(function (uuid) {
        var investment = portfolio[uuid];
        return investment;
      });
      break;
    case 'ADD_INVESTMENT':
      return [].concat(_toConsumableArray(state), [action.investment]);
      break;
    default:
      return state;
  }
};

exports.default = investments;