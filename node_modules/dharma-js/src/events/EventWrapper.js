'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventWrapper = function () {
  function EventWrapper(event, queue, callback) {
    _classCallCheck(this, EventWrapper);

    this.event = event;
    this.id = (0, _uuid2.default)();
    this.queue = queue;

    if (callback) {
      this.watch(callback);
    }
  }

  _createClass(EventWrapper, [{
    key: 'watch',
    value: function watch(callback) {
      this.queue.enqueue(this.id, callback);
    }
  }, {
    key: 'get',
    value: function get(callback) {
      this.event.get(callback);
    }
  }, {
    key: 'stopWatching',
    value: function stopWatching(callback) {
      this.queue.remove(this.id, callback);
    }
  }]);

  return EventWrapper;
}();

module.exports = EventWrapper;