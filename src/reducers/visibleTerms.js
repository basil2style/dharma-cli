'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var visibleTerms = function visibleTerms() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var action = arguments[1];

  switch (action.type) {
    case 'DISPLAY_TERMS':
      return action.index;
      break;
    case 'INIT_STATE':
      return 0;
      break;
    default:
      return state;
  }
};

exports.default = visibleTerms;