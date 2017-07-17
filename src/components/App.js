'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactBlessed = require('react-blessed');

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _reducers = require('../reducers');

var _Dashboard = require('./Dashboard');

var _Dashboard2 = _interopRequireDefault(_Dashboard);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var App = function () {
  function App(investor) {
    _classCallCheck(this, App);

    this.investor = investor;
  }

  _createClass(App, [{
    key: 'start',
    value: async function start() {
      var store = (0, _redux.createStore)(_reducers.dashboardApp);

      try {
        await this.investor.startDaemon(store, errorCallback);
      } catch (err) {
        console.error(err.stack);
      }

      // Creating our screen
      var screen = blessed.screen({
        autoPadding: true,
        smartCSR: true,
        title: 'react-blessed hello world'
      });

      // Adding a way to quit the program
      screen.key(['escape', 'q', 'C-c'], async function (ch, key) {
        await this.investor.stopDaemon();
        return process.exit(0);
      });

      (0, _reactBlessed.render)(_react2.default.createElement(
        _reactRedux.Provider,
        { store: store },
        _react2.default.createElement(_Dashboard2.default, null)
      ), screen);
    }
  }]);

  return App;
}();

module.exports = App;