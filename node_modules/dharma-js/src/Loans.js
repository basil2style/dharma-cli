'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Loan = require('./Loan.js');

var _Loan2 = _interopRequireDefault(_Loan);

var _Terms = require('./Terms.js');

var _Terms2 = _interopRequireDefault(_Terms);

var _Attestation = require('./Attestation.js');

var _Attestation2 = _interopRequireDefault(_Attestation);

var _LoanContract = require('./contract_wrappers/LoanContract.js');

var _LoanContract2 = _interopRequireDefault(_LoanContract);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _Events = require('./events/Events.js');

var _Events2 = _interopRequireDefault(_Events);

var _Constants = require('./Constants.js');

var _Constants2 = _interopRequireDefault(_Constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Loans = function () {
  function Loans(web3) {
    _classCallCheck(this, Loans);

    this.web3 = web3;
    this.events = new _Events2.default(web3);
  }

  _createClass(Loans, [{
    key: 'create',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(data) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!data.uuid) {
                  data.uuid = this.web3.sha3((0, _uuid2.default)());
                }

                return _context.abrupt('return', _Loan2.default.create(this.web3, data));

              case 2:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function create(_x) {
        return _ref.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: 'get',
    value: function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(uuid) {
        var web3, contract, data, loanData, signature, loanCreated, loanCreatedEvents, loanCreatedBlock, auctionPeriodEndBlock, reviewPeriodEndBlock, termBegin, termBeginEvents, block;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                web3 = this.web3;
                _context2.next = 3;
                return _LoanContract2.default.instantiate(this.web3);

              case 3:
                contract = _context2.sent;
                _context2.next = 6;
                return contract.getData.call(uuid);

              case 6:
                data = _context2.sent;
                loanData = {
                  uuid: uuid,
                  borrower: data[0],
                  principal: this.web3.toBigNumber(data[1]),
                  terms: _Terms2.default.byteStringToJson(this.web3, data[2]),
                  attestor: data[3],
                  attestorFee: this.web3.toBigNumber(data[4]),
                  defaultRisk: this.web3.toBigNumber(data[5])
                };
                _context2.next = 10;
                return contract.getAttestorSignature.call(uuid);

              case 10:
                signature = _context2.sent;

                loanData.signature = _Attestation2.default.fromSignatureData(this.web3, signature);

                _context2.next = 14;
                return this.events.created({ uuid: uuid }, { fromBlock: 0, toBlock: 'latest' });

              case 14:
                loanCreated = _context2.sent;
                _context2.next = 17;
                return new Promise(function (accept, reject) {
                  loanCreated.get(function (err, loanCreatedEvents) {
                    if (err) reject(err);else accept(loanCreatedEvents);
                  });
                });

              case 17:
                loanCreatedEvents = _context2.sent;
                loanCreatedBlock = loanCreatedEvents[0].args.blockNumber;
                _context2.next = 21;
                return contract.getAuctionEndBlock.call(uuid);

              case 21:
                auctionPeriodEndBlock = _context2.sent;
                _context2.next = 24;
                return contract.getReviewPeriodEndBlock.call(uuid);

              case 24:
                reviewPeriodEndBlock = _context2.sent;


                loanData.auctionPeriodEndBlock = this.web3.toBigNumber(auctionPeriodEndBlock);
                loanData.reviewPeriodEndBlock = this.web3.toBigNumber(reviewPeriodEndBlock);

                loanData.auctionPeriodLength = auctionPeriodEndBlock.minus(loanCreatedBlock);
                loanData.reviewPeriodLength = reviewPeriodEndBlock.minus(auctionPeriodEndBlock);

                _context2.next = 31;
                return contract.getState.call(uuid);

              case 31:
                loanData.state = _context2.sent;

                loanData.state = loanData.state.toNumber();

                if (!(loanData.state == _Constants2.default.ACCEPTED_STATE)) {
                  _context2.next = 48;
                  break;
                }

                _context2.next = 36;
                return contract.getInterestRate.call(uuid);

              case 36:
                loanData.interestRate = _context2.sent;
                _context2.next = 39;
                return this.events.termBegin({ uuid: uuid }, { fromBlock: 0, toBlock: 'latest' });

              case 39:
                termBegin = _context2.sent;
                _context2.next = 42;
                return new Promise(function (resolve, reject) {
                  termBegin.get(function (err, termBeginEvents) {
                    if (err) reject(err);else resolve(termBeginEvents);
                  });
                });

              case 42:
                termBeginEvents = _context2.sent;

                loanData.termBeginBlockNumber = termBeginEvents[0].args.blockNumber;
                _context2.next = 46;
                return new Promise(function (resolve, reject) {
                  web3.eth.getBlock(loanData.termBeginBlockNumber, function (err, block) {
                    if (err) reject(err);else resolve(block);
                  });
                });

              case 46:
                block = _context2.sent;

                loanData.termBeginTimestamp = block.timestamp;

              case 48:
                return _context2.abrupt('return', _Loan2.default.create(this.web3, loanData));

              case 49:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function get(_x2) {
        return _ref2.apply(this, arguments);
      }

      return get;
    }()
  }]);

  return Loans;
}();

module.exports = Loans;