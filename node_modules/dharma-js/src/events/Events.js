'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _LoanContract = require('../contract_wrappers/LoanContract.js');

var _LoanContract2 = _interopRequireDefault(_LoanContract);

var _AuctionCompleted = require('./AuctionCompleted.js');

var _AuctionCompleted2 = _interopRequireDefault(_AuctionCompleted);

var _ReviewPeriodCompleted = require('./ReviewPeriodCompleted.js');

var _ReviewPeriodCompleted2 = _interopRequireDefault(_ReviewPeriodCompleted);

var _EventWrapper = require('./EventWrapper.js');

var _EventWrapper2 = _interopRequireDefault(_EventWrapper);

var _EventQueue = require('./EventQueue.js');

var _EventQueue2 = _interopRequireDefault(_EventQueue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EVENTS = {
  created: 'LoanCreated',
  termBegin: 'LoanTermBegin',
  bidsRejected: 'LoanBidsRejected',
  repayment: 'PeriodicRepayment',
  valueRedeemed: 'ValueRedeemed',
  transfer: 'Transfer',
  approval: 'Approval'
};

var Events = function () {
  function Events(web3, defaultOptions) {
    var _this = this;

    _classCallCheck(this, Events);

    this.web3 = web3;
    this.defaultOptions = defaultOptions || {};
    this.queues = {};

    var _loop = function _loop(eventName) {
      _this[eventName] = function () {
        var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(filter, additionalFilter, callback) {
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.next = 2;
                  return _this.getEvent(EVENTS[eventName], filter, additionalFilter, callback);

                case 2:
                  return _context3.abrupt('return', _context3.sent);

                case 3:
                case 'end':
                  return _context3.stop();
              }
            }
          }, _callee3, _this);
        }));

        return function (_x3, _x4, _x5) {
          return _ref3.apply(this, arguments);
        };
      }();
    };

    for (var eventName in EVENTS) {
      _loop(eventName);
    }

    this.auctionCompleted = function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(callback) {
        var identifier, event, queue;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                identifier = _EventQueue2.default.getIdentifier('AuctionCompleted', defaultOptions, {});
                _context.next = 3;
                return _AuctionCompleted2.default.create(web3, defaultOptions, callback);

              case 3:
                event = _context.sent;


                if (!(identifier in _this.queues)) {
                  _this.queues[identifier] = new _EventQueue2.default(identifier, event);
                }

                queue = _this.queues[identifier];
                return _context.abrupt('return', new _EventWrapper2.default(event, queue, callback));

              case 7:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }();

    this.reviewPeriodCompleted = function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(callback) {
        var identifier, event, queue;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                identifier = _EventQueue2.default.getIdentifier('ReviewPeriodCompleted', defaultOptions, {});
                _context2.next = 3;
                return _ReviewPeriodCompleted2.default.create(web3, defaultOptions, callback);

              case 3:
                event = _context2.sent;


                if (!(identifier in _this.queues)) {
                  _this.queues[identifier] = new _EventQueue2.default(identifier, event);
                }

                queue = _this.queues[identifier];
                return _context2.abrupt('return', new _EventWrapper2.default(event, queue, callback));

              case 7:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, _this);
      }));

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    }();
  }

  _createClass(Events, [{
    key: 'getEvent',
    value: function () {
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(eventName, filter, additionalFilter, callback) {
        var contract,
            event,
            queueIdentifier,
            queue,
            _args4 = arguments;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return _LoanContract2.default.instantiate(this.web3);

              case 2:
                contract = _context4.sent;


                if (_args4.length === 2 && typeof filter === 'function') {
                  callback = filter;
                  filter = {};
                } else if (_args4.length === 3 && typeof additionalFilter === 'function') {
                  callback = additionalFilter;
                  additionalFilter = {};
                }

                filter = filter || this.defaultOptions;

                Object.assign(filter, this.defaultOptions);

                event = contract[eventName](filter, additionalFilter);
                queueIdentifier = _EventQueue2.default.getIdentifier(eventName, filter, additionalFilter);


                if (!(queueIdentifier in this.queues)) {
                  this.queues[queueIdentifier] = new _EventQueue2.default(queueIdentifier, event);
                }

                queue = this.queues[queueIdentifier];
                return _context4.abrupt('return', new _EventWrapper2.default(event, queue, callback));

              case 11:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function getEvent(_x6, _x7, _x8, _x9) {
        return _ref4.apply(this, arguments);
      }

      return getEvent;
    }()
  }]);

  return Events;
}();

module.exports = Events;