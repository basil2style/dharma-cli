'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Constants = require('./Constants.js');

var _Util = require('./Util.js');

var _Util2 = _interopRequireDefault(_Util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StateListeners = function () {
  function StateListeners(web3, loan) {
    _classCallCheck(this, StateListeners);

    this.web3 = web3;
    this.loan = loan;
    this.listeners = {};
  }

  _createClass(StateListeners, [{
    key: 'refresh',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var state;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.loan.getState();

              case 2:
                state = _context.sent;


                this.loan.state = state.toNumber();
                _context.t0 = this.loan.state;
                _context.next = _context.t0 === _Constants.NULL_STATE ? 7 : _context.t0 === _Constants.AUCTION_STATE ? 10 : _context.t0 === _Constants.REVIEW_STATE ? 13 : 16;
                break;

              case 7:
                _context.next = 9;
                return this.setupNullStateListeners();

              case 9:
                return _context.abrupt('break', 17);

              case 10:
                _context.next = 12;
                return this.setupAuctionStateListeners();

              case 12:
                return _context.abrupt('break', 17);

              case 13:
                _context.next = 15;
                return this.setupReviewStateListeners();

              case 15:
                return _context.abrupt('break', 17);

              case 16:
                return _context.abrupt('break', 17);

              case 17:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function refresh() {
        return _ref.apply(this, arguments);
      }

      return refresh;
    }()
  }, {
    key: 'setupNullStateListeners',
    value: function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.loan.events.created();

              case 2:
                this.listeners['loanCreated'] = _context2.sent;

                this.listeners['loanCreated'].watch(this.onLoanCreated());

              case 4:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function setupNullStateListeners() {
        return _ref2.apply(this, arguments);
      }

      return setupNullStateListeners;
    }()
  }, {
    key: 'setupAuctionStateListeners',
    value: function () {
      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.loan.events.auctionCompleted();

              case 2:
                this.listeners['auctionCompleted'] = _context3.sent;

                this.listeners['auctionCompleted'].watch(this.onAuctionCompleted());

              case 4:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function setupAuctionStateListeners() {
        return _ref3.apply(this, arguments);
      }

      return setupAuctionStateListeners;
    }()
  }, {
    key: 'setupReviewStateListeners',
    value: function () {
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.loan.events.bidsRejected();

              case 2:
                this.listeners['bidsRejected'] = _context4.sent;

                this.listeners['bidsRejected'].watch(this.onBidsRejected());

                _context4.next = 6;
                return this.loan.events.termBegin();

              case 6:
                this.listeners['termBegin'] = _context4.sent;

                this.listeners['termBegin'].watch(this.onTermBegin());

                _context4.next = 10;
                return this.loan.events.reviewPeriodCompleted();

              case 10:
                this.listeners['bidsIgnored'] = _context4.sent;

                this.listeners['bidsIgnored'].watch(this.onBidsIgnored());

              case 12:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function setupReviewStateListeners() {
        return _ref4.apply(this, arguments);
      }

      return setupReviewStateListeners;
    }()
  }, {
    key: 'onLoanCreated',
    value: function onLoanCreated() {
      var _this2 = this;

      var _this = this;

      return function () {
        var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(err, logs) {
          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  _this.loan.state = _Constants.AUCTION_STATE;
                  _context5.next = 3;
                  return _this.refresh();

                case 3:
                  _this.listeners['loanCreated'].stopWatching(function () {});

                case 4:
                case 'end':
                  return _context5.stop();
              }
            }
          }, _callee5, _this2);
        }));

        return function (_x, _x2) {
          return _ref5.apply(this, arguments);
        };
      }();
    }
  }, {
    key: 'onAuctionCompleted',
    value: function onAuctionCompleted() {
      var _this3 = this;

      var _this = this;

      return function () {
        var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(err, logs) {
          return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
              switch (_context6.prev = _context6.next) {
                case 0:
                  _this.loan.state = _Constants.REVIEW_STATE;
                  _context6.next = 3;
                  return _this.refresh();

                case 3:
                  _this.listeners['auctionCompleted'].stopWatching(function () {});

                case 4:
                case 'end':
                  return _context6.stop();
              }
            }
          }, _callee6, _this3);
        }));

        return function (_x3, _x4) {
          return _ref6.apply(this, arguments);
        };
      }();
    }
  }, {
    key: 'onBidsRejected',
    value: function onBidsRejected() {
      var _this4 = this;

      var _this = this;

      return function () {
        var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(err, logs) {
          return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
              switch (_context7.prev = _context7.next) {
                case 0:
                  _this.loan.state = _Constants.REJECTED_STATE;
                  _context7.next = 3;
                  return _this.refresh();

                case 3:

                  _this.listeners['bidsRejected'].stopWatching(function () {});

                  if ('termBegin' in _this.listeners) {
                    _this.listeners['termBegin'].stopWatching(function () {});
                  }

                  if ('bidsIgnored' in _this.listeners) {
                    _this.listeners['bidsIgnored'].stopWatching(function () {});
                  }

                case 6:
                case 'end':
                  return _context7.stop();
              }
            }
          }, _callee7, _this4);
        }));

        return function (_x5, _x6) {
          return _ref7.apply(this, arguments);
        };
      }();
    }
  }, {
    key: 'onTermBegin',
    value: function onTermBegin() {
      var _this5 = this;

      var _this = this;

      return function () {
        var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(err, logs) {
          var termBeginBlock;
          return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
              switch (_context8.prev = _context8.next) {
                case 0:
                  _this.loan.state = _Constants.ACCEPTED_STATE;

                  _context8.next = 3;
                  return _Util2.default.getBlock(_this.web3, logs.blockNumber);

                case 3:
                  termBeginBlock = _context8.sent;


                  _this.loan.termBeginBlockNumber = termBeginBlock.number;
                  _this.loan.termBeginTimestamp = termBeginBlock.timestamp;

                  _context8.next = 8;
                  return _this.loan.getInterestRate();

                case 8:
                  _this.loan.interestRate = _context8.sent;
                  _context8.next = 11;
                  return _this.refresh();

                case 11:

                  _this.listeners['termBegin'].stopWatching(function () {});

                  if ('bidsRejected' in _this.listeners) _this.listeners['bidsRejected'].stopWatching(function () {});

                  if ('bidsIgnored' in _this.listeners) {
                    _this.listeners['bidsIgnored'].stopWatching(function () {});
                  }

                case 14:
                case 'end':
                  return _context8.stop();
              }
            }
          }, _callee8, _this5);
        }));

        return function (_x7, _x8) {
          return _ref8.apply(this, arguments);
        };
      }();
    }
  }, {
    key: 'onBidsIgnored',
    value: function onBidsIgnored() {
      var _this6 = this;

      var _this = this;

      return function () {
        var _ref9 = _asyncToGenerator(regeneratorRuntime.mark(function _callee9(err, logs) {
          return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
              switch (_context9.prev = _context9.next) {
                case 0:
                  _this.loan.state = _Constants.REJECTED_STATE;
                  _context9.next = 3;
                  return _this.refresh();

                case 3:

                  _this.listeners['bidsIgnored'].stopWatching(function () {});

                  if ('termBegin' in _this.listeners) {
                    _this.listeners['termBegin'].stopWatching(function () {});
                  }

                  if ('bidsRejected' in _this.listeners) _this.listeners['bidsRejected'].stopWatching(function () {});

                case 6:
                case 'end':
                  return _context9.stop();
              }
            }
          }, _callee9, _this6);
        }));

        return function (_x9, _x10) {
          return _ref9.apply(this, arguments);
        };
      }();
    }
  }]);

  return StateListeners;
}();

module.exports = StateListeners;