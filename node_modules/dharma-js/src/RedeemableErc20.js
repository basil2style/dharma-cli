'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _LoanContract = require('./contract_wrappers/LoanContract.js');

var _LoanContract2 = _interopRequireDefault(_LoanContract);

var _Constants = require('./Constants.js');

var _Constants2 = _interopRequireDefault(_Constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RedeemableERC20 = function () {
  function RedeemableERC20(web3, uuid) {
    _classCallCheck(this, RedeemableERC20);

    this.web3 = web3;
    this.uuid = uuid;
  }

  _createClass(RedeemableERC20, [{
    key: 'transfer',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(tokenRecipient, value, options) {
        var contract, balance;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _LoanContract2.default.instantiate(this.web3);

              case 2:
                contract = _context.sent;


                options = options || { from: this.web3.eth.defaultAccount };

                _context.next = 6;
                return this.balanceOf(options.from);

              case 6:
                balance = _context.sent;

                if (!balance.lt(value)) {
                  _context.next = 9;
                  break;
                }

                throw new Error("Your account balance is not high enough to transfer " + value.toString() + " wei.");

              case 9:
                return _context.abrupt('return', contract.transfer(this.uuid, tokenRecipient, value, options));

              case 10:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function transfer(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
      }

      return transfer;
    }()
  }, {
    key: 'getRedeemableValue',
    value: function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(tokenHolder, options) {
        var contract;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return _LoanContract2.default.instantiate(this.web3);

              case 2:
                contract = _context2.sent;


                options = options || { from: this.web3.eth.defaultAccount };

                return _context2.abrupt('return', contract.getRedeemableValue.call(this.uuid, tokenHolder, options));

              case 5:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getRedeemableValue(_x4, _x5) {
        return _ref2.apply(this, arguments);
      }

      return getRedeemableValue;
    }()
  }, {
    key: 'redeemValue',
    value: function () {
      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(recipient, options) {
        var contract, state, balance;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return _LoanContract2.default.instantiate(this.web3);

              case 2:
                contract = _context3.sent;
                _context3.next = 5;
                return contract.getState.call(this.uuid);

              case 5:
                state = _context3.sent;

                if (state.equals(_Constants2.default.ACCEPTED_STATE)) {
                  _context3.next = 8;
                  break;
                }

                throw new Error("Value cannot be redeemed until the loan term has begun.");

              case 8:

                options = options || { from: recipient };

                _context3.next = 11;
                return this.balanceOf(options.from);

              case 11:
                balance = _context3.sent;

                if (balance.gt(0)) {
                  _context3.next = 14;
                  break;
                }

                throw new Error("Value cannot be redeemed by non-investors.");

              case 14:
                return _context3.abrupt('return', contract.redeemValue(this.uuid, recipient, options));

              case 15:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function redeemValue(_x6, _x7) {
        return _ref3.apply(this, arguments);
      }

      return redeemValue;
    }()
  }, {
    key: 'balanceOf',
    value: function () {
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(account, options) {
        var contract;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return _LoanContract2.default.instantiate(this.web3);

              case 2:
                contract = _context4.sent;


                options = options || { from: this.web3.eth.defaultAccount };

                return _context4.abrupt('return', contract.balanceOf.call(this.uuid, account, options));

              case 5:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function balanceOf(_x8, _x9) {
        return _ref4.apply(this, arguments);
      }

      return balanceOf;
    }()
  }, {
    key: 'approve',
    value: function () {
      var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(spender, value, options) {
        var contract;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return _LoanContract2.default.instantiate(this.web3);

              case 2:
                contract = _context5.sent;


                options = options || { from: this.web3.eth.defaultAccount };

                return _context5.abrupt('return', contract.approve(this.uuid, spender, value, options));

              case 5:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function approve(_x10, _x11, _x12) {
        return _ref5.apply(this, arguments);
      }

      return approve;
    }()
  }, {
    key: 'allowance',
    value: function () {
      var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(owner, spender, options) {
        var contract;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return _LoanContract2.default.instantiate(this.web3);

              case 2:
                contract = _context6.sent;


                options = options || { from: this.web3.eth.defaultAccount };

                return _context6.abrupt('return', contract.allowance.call(this.uuid, owner, spender, options));

              case 5:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function allowance(_x13, _x14, _x15) {
        return _ref6.apply(this, arguments);
      }

      return allowance;
    }()
  }, {
    key: 'transferFrom',
    value: function () {
      var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(from, to, value, options) {
        var contract, allowance;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return _LoanContract2.default.instantiate(this.web3);

              case 2:
                contract = _context7.sent;


                options = options || { from: this.web3.eth.defaultAccount };

                _context7.next = 6;
                return this.allowance(from, options.from);

              case 6:
                allowance = _context7.sent;

                if (!allowance.lt(value)) {
                  _context7.next = 9;
                  break;
                }

                throw new Error("Your allowance on account " + from + " is not high enough to transfer " + value.toString() + " wei.");

              case 9:
                return _context7.abrupt('return', contract.transferFrom(this.uuid, from, to, value, options));

              case 10:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function transferFrom(_x16, _x17, _x18, _x19) {
        return _ref7.apply(this, arguments);
      }

      return transferFrom;
    }()
  }]);

  return RedeemableERC20;
}();

module.exports = RedeemableERC20;