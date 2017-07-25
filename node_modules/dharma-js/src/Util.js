'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _es6Promisify = require('es6-promisify');

var _es6Promisify2 = _interopRequireDefault(_es6Promisify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Util = function () {
  function Util() {
    _classCallCheck(this, Util);
  }

  _createClass(Util, null, [{
    key: 'stripZeroEx',
    value: function stripZeroEx(data) {
      if (data.slice(0, 2) === '0x') return data.slice(2);else return data;
    }
  }, {
    key: 'isTestRpc',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(web3) {
        var getNodeVersion, nodeVersion;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                getNodeVersion = (0, _es6Promisify2.default)(web3.version.getNode);
                _context.next = 3;
                return getNodeVersion();

              case 3:
                nodeVersion = _context.sent;
                return _context.abrupt('return', _lodash2.default.includes(nodeVersion, 'TestRPC'));

              case 5:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function isTestRpc(_x) {
        return _ref.apply(this, arguments);
      }

      return isTestRpc;
    }()
  }, {
    key: 'getLatestBlockNumber',
    value: function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(web3) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt('return', new Promise(function (accept, reject) {
                  web3.eth.getBlockNumber(function (err, blockNumber) {
                    if (err) reject(err);else {
                      accept(blockNumber);
                    }
                  });
                }));

              case 1:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getLatestBlockNumber(_x2) {
        return _ref2.apply(this, arguments);
      }

      return getLatestBlockNumber;
    }()
  }, {
    key: 'getBlock',
    value: function () {
      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(web3, blockNumber) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt('return', new Promise(function (accept, reject) {
                  web3.eth.getBlock(blockNumber, function (err, block) {
                    if (err) reject(err);else {
                      accept(block);
                    }
                  });
                }));

              case 1:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getBlock(_x3, _x4) {
        return _ref3.apply(this, arguments);
      }

      return getBlock;
    }()
  }]);

  return Util;
}();

module.exports = Util;