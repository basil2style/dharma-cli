'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redux = require('redux');

var _investments = require('./investments');

var _investments2 = _interopRequireDefault(_investments);

var _visibleTerms = require('./visibleTerms');

var _visibleTerms2 = _interopRequireDefault(_visibleTerms);

var _logs = require('./logs');

var _logs2 = _interopRequireDefault(_logs);

var _totalCash = require('./totalCash');

var _totalCash2 = _interopRequireDefault(_totalCash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dashboardApp = (0, _redux.combineReducers)({
  investments: _investments2.default,
  visibleTerms: _visibleTerms2.default,
  logs: _logs2.default,
  totalCash: _totalCash2.default
});

exports.default = dashboardApp;