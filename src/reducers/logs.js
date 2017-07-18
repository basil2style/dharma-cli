'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var logs = function logs() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var action = arguments[1];

  switch (action.type) {
    case 'LOG_MESSAGE':
      return action.message;
      break;
    default:
      return null;
  }
};

exports.default = logs;