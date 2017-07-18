'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redux = require('redux');

var _loans = require('./loans');

var _loans2 = _interopRequireDefault(_loans);

var _bids = require('./bids');

var _bids2 = _interopRequireDefault(_bids);

var _visibleTerms = require('./visibleTerms');

var _visibleTerms2 = _interopRequireDefault(_visibleTerms);

var _logs = require('./logs');

var _logs2 = _interopRequireDefault(_logs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dashboardApp = (0, _redux.combineReducers)({
  loans: _loans2.default,
  bids: _bids2.default,
  visibleTerms: _visibleTerms2.default,
  logs: _logs2.default
});

exports.default = dashboardApp;