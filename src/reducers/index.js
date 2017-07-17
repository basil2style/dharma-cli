'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redux = require('redux');

var _loans = require('./loans');

var _loans2 = _interopRequireDefault(_loans);

var _bids = require('./bids');

var _bids2 = _interopRequireDefault(_bids);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dashboardApp = (0, _redux.combineReducers)({
  loans: _loans2.default,
  bids: _bids2.default
});

exports.default = dashboardApp;