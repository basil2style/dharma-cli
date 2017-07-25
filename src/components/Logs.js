'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _blessed = require('blessed');

var _blessed2 = _interopRequireDefault(_blessed);

var _blessedContrib = require('blessed-contrib');

var _blessedContrib2 = _interopRequireDefault(_blessedContrib);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var logStyle = {
  top: '60%',
  left: 0,
  width: '30%',
  height: '40%',
  label: 'Logs',
  border: {
    type: 'line',
    fg: 'cyan'
  },
  style: {
    fg: '#007f00'
  },
  tags: true
};

var Logs = function () {
  function Logs() {
    _classCallCheck(this, Logs);

    this.log = _blessedContrib2.default.log(logStyle);
  }

  _createClass(Logs, [{
    key: 'getNode',
    value: function getNode() {
      return this.log;
    }
  }, {
    key: 'render',
    value: function render(message) {
      if (message) this.log.log(message);
    }
  }]);

  return Logs;
}();

module.exports = Logs;