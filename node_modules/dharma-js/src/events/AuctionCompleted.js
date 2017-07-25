'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Util = require('../Util.js');

var _Util2 = _interopRequireDefault(_Util);

var _LoanContract = require('../contract_wrappers/LoanContract.js');

var _LoanContract2 = _interopRequireDefault(_LoanContract);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuctionCompleted = function () {
  function AuctionCompleted(web3, auctionPeriodEndBlock) {
    _classCallCheck(this, AuctionCompleted);

    this.web3 = web3;
    this.auctionPeriodEndBlock = auctionPeriodEndBlock;
    this.blockListener = null;
    this.listening = false;
  }

  _createClass(AuctionCompleted, [{
    key: 'watch',
    value: function watch(callback) {
      var web3 = this.web3;
      var auctionPeriodEndBlock = this.auctionPeriodEndBlock;

      this.listening = true;

      this.blockListener = this.web3.eth.filter('latest');
      this.blockListener.watch(function (err, result) {
        if (err) {
          this.listening = false;
          callback(err, null);
        } else {
          web3.eth.getBlockNumber(function (err, blockNumber) {

            if (!this.listening) return;

            if (auctionPeriodEndBlock.lt(blockNumber)) {
              this.listening = false;

              callback(null, blockNumber);
            }
          }.bind(this));
        }
      }.bind(this));
    }
  }, {
    key: 'stopWatching',
    value: function stopWatching(callback) {
      this.listening = false;
      this.blockListener.stopWatching(callback);
    }
  }], [{
    key: 'create',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(web3, options, callback) {
        var contract, auctionPeriodEndBlock, auctionCompletedEvent;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _LoanContract2.default.instantiate(web3);

              case 2:
                contract = _context.sent;

                if (!(options.uuid === 'undefined')) {
                  _context.next = 5;
                  break;
                }

                throw new Error('AuctionCompleted event requires UUID to follow.');

              case 5:
                _context.next = 7;
                return contract.getAuctionEndBlock.call(options.uuid);

              case 7:
                auctionPeriodEndBlock = _context.sent;

                if (!auctionPeriodEndBlock.equals(0)) {
                  _context.next = 10;
                  break;
                }

                throw new Error('AuctionCompleted listener can only be activated once loan' + 'has been broadcasted');

              case 10:
                auctionCompletedEvent = new AuctionCompleted(web3, auctionPeriodEndBlock);

                if (!callback) {
                  _context.next = 15;
                  break;
                }

                auctionCompletedEvent.watch(callback);
                _context.next = 16;
                break;

              case 15:
                return _context.abrupt('return', auctionCompletedEvent);

              case 16:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function create(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
      }

      return create;
    }()
  }]);

  return AuctionCompleted;
}();

module.exports = AuctionCompleted;