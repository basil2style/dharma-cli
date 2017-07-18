'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var totalCash = function totalCash() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var action = arguments[1];

  switch (action.type) {
    case 'UPDATE_TOTAL_CASH':
      return action.totalCash;
      break;
    default:
      return state;
  }
};

exports.default = totalCash;