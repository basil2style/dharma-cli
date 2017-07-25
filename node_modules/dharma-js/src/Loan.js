'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _RedeemableErc = require('./RedeemableErc20.js');

var _RedeemableErc2 = _interopRequireDefault(_RedeemableErc);

var _LoanContract = require('./contract_wrappers/LoanContract.js');

var _LoanContract2 = _interopRequireDefault(_LoanContract);

var _config = require('../config.js');

var _config2 = _interopRequireDefault(_config);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _LoanSchema = require('./schemas/LoanSchema.js');

var _LoanSchema2 = _interopRequireDefault(_LoanSchema);

var _BidSchema = require('./schemas/BidSchema.js');

var _BidSchema2 = _interopRequireDefault(_BidSchema);

var _Events = require('./events/Events.js');

var _Events2 = _interopRequireDefault(_Events);

var _Attestation = require('./Attestation.js');

var _Attestation2 = _interopRequireDefault(_Attestation);

var _Terms = require('./Terms.js');

var _Terms2 = _interopRequireDefault(_Terms);

var _Util = require('./Util.js');

var _Util2 = _interopRequireDefault(_Util);

var _Constants = require('./Constants.js');

var _Constants2 = _interopRequireDefault(_Constants);

var _Servicing = require('./Servicing.js');

var _Servicing2 = _interopRequireDefault(_Servicing);

var _StateListeners = require('./StateListeners.js');

var _StateListeners2 = _interopRequireDefault(_StateListeners);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UNDEFINED_GAS_ALLOWANCE = 500000;

var Loan = function (_RedeemableERC) {
  _inherits(Loan, _RedeemableERC);

  function Loan(web3, params) {
    _classCallCheck(this, Loan);

    return _possibleConstructorReturn(this, (Loan.__proto__ || Object.getPrototypeOf(Loan)).call(this, web3, params));
  }

  _createClass(Loan, [{
    key: 'toJson',
    value: function toJson() {
      var json = {
        uuid: this.uuid,
        borrower: this.borrower,
        principal: this.principal,
        attestor: this.attestor,
        attestorFee: this.attestorFee,
        terms: this.terms.toJson(),
        defaultRisk: this.defaultRisk,
        signature: this.signature,
        auctionPeriodLength: this.auctionPeriodLength,
        reviewPeriodLength: this.reviewPeriodLength
      };

      if (this.interestRate) json.interestRate = this.interestRate;
      if (this.termBeginBlockNumber) json.termBeginBlockNumber = this.termBeginBlockNumber;
      if (this.termBeginTimestamp) json.termBeginTimestamp = this.termBeginTimestamp;
      if (this.auctionPeriodEndBlock) json.auctionPeriodEndBlock = this.auctionPeriodEndBlock;
      if (this.reviewPeriodEndBlock) json.reviewPeriodEndBlock = this.reviewPeriodEndBlock;

      return json;
    }
  }, {
    key: 'equals',
    value: function equals(loan) {
      return loan.uuid === this.uuid && loan.borrower === this.borrower && loan.principal.equals(this.principal) && loan.terms.equals(this.terms) && loan.attestor === this.attestor && loan.attestorFee.equals(this.attestorFee) && loan.defaultRisk.equals(this.defaultRisk) && _lodash2.default.isEqual(loan.signature, this.signature) && loan.auctionPeriodLength.equals(this.auctionPeriodLength) && loan.reviewPeriodLength.equals(this.reviewPeriodLength);
    }
  }, {
    key: 'broadcast',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(options) {
        var contract, loanExists;
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
                return this.exists();

              case 6:
                loanExists = _context.sent;

                if (!loanExists) {
                  _context.next = 9;
                  break;
                }

                throw new Error('Cannot broadcast loan request -- loan request with ' + 'conflicting UUID already exists.');

              case 9:

                if (typeof options.gas === 'undefined') {
                  options.gas = UNDEFINED_GAS_ALLOWANCE;
                }

                return _context.abrupt('return', contract.createLoan(this.uuid, this.borrower, this.web3.toHex(this.principal), this.terms.toByteString(), this.attestor, this.web3.toHex(this.attestorFee), this.web3.toHex(this.defaultRisk), this.signature.r, this.signature.s, this.signature.v, this.web3.toHex(this.auctionPeriodLength), this.web3.toHex(this.reviewPeriodLength), options));

              case 11:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function broadcast(_x) {
        return _ref.apply(this, arguments);
      }

      return broadcast;
    }()
  }, {
    key: 'exists',
    value: function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        var contract, borrower;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return _LoanContract2.default.instantiate(this.web3);

              case 2:
                contract = _context2.sent;
                _context2.next = 5;
                return contract.getBorrower.call(this.uuid);

              case 5:
                borrower = _context2.sent;
                return _context2.abrupt('return', this.web3.toDecimal(borrower) > 0);

              case 7:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function exists() {
        return _ref2.apply(this, arguments);
      }

      return exists;
    }()
  }, {
    key: 'bid',
    value: function () {
      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(amount, tokenRecipient, minInterestRate, options) {
        var contract;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return _LoanContract2.default.instantiate(this.web3);

              case 2:
                contract = _context3.sent;


                options = options || { from: tokenRecipient };

                if (typeof options.gas === 'undefined') {
                  options.gas = UNDEFINED_GAS_ALLOWANCE;
                }

                if (this.web3.isAddress(tokenRecipient)) {
                  _context3.next = 7;
                  break;
                }

                throw new Error("Token recipient must be valid ethereum address.");

              case 7:

                options.value = amount;
                return _context3.abrupt('return', contract.bid(this.uuid, tokenRecipient, this.web3.toHex(minInterestRate), options));

              case 9:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function bid(_x2, _x3, _x4, _x5) {
        return _ref3.apply(this, arguments);
      }

      return bid;
    }()
  }, {
    key: 'getBids',
    value: function () {
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
        var _this2 = this;

        var contract, numBids, bids;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return _LoanContract2.default.instantiate(this.web3);

              case 2:
                contract = _context5.sent;
                _context5.next = 5;
                return contract.getNumBids.call(this.uuid);

              case 5:
                numBids = _context5.sent;
                _context5.next = 8;
                return Promise.all(_lodash2.default.range(numBids).map(function () {
                  var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(index) {
                    var bid;
                    return regeneratorRuntime.wrap(function _callee4$(_context4) {
                      while (1) {
                        switch (_context4.prev = _context4.next) {
                          case 0:
                            _context4.next = 2;
                            return contract.getBidByIndex.call(_this2.uuid, index);

                          case 2:
                            bid = _context4.sent;
                            return _context4.abrupt('return', {
                              bidder: bid[0],
                              amount: bid[1],
                              minInterestRate: bid[2]
                            });

                          case 4:
                          case 'end':
                            return _context4.stop();
                        }
                      }
                    }, _callee4, _this2);
                  }));

                  return function (_x6) {
                    return _ref5.apply(this, arguments);
                  };
                }()));

              case 8:
                bids = _context5.sent;
                return _context5.abrupt('return', bids);

              case 10:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function getBids() {
        return _ref4.apply(this, arguments);
      }

      return getBids;
    }()
  }, {
    key: 'getBid',
    value: function () {
      var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(bidder) {
        var contract, bid;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return _LoanContract2.default.instantiate(this.web3);

              case 2:
                contract = _context6.sent;
                _context6.next = 5;
                return contract.getBidByAddress.call(this.uuid, bidder);

              case 5:
                bid = _context6.sent;
                return _context6.abrupt('return', {
                  bidder: bid[0],
                  amount: bid[1],
                  minInterestRate: bid[2]
                });

              case 7:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function getBid(_x7) {
        return _ref6.apply(this, arguments);
      }

      return getBid;
    }()
  }, {
    key: 'isRefundWithdrawn',
    value: function () {
      var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(bidder) {
        var bid;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.getBid(bidder);

              case 2:
                bid = _context7.sent;
                return _context7.abrupt('return', bid.amount.equals(0));

              case 4:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function isRefundWithdrawn(_x8) {
        return _ref7.apply(this, arguments);
      }

      return isRefundWithdrawn;
    }()
  }, {
    key: 'getContract',
    value: function () {
      var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8() {
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return _LoanContract2.default.instantiate(this.web3);

              case 2:
                return _context8.abrupt('return', _context8.sent);

              case 3:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function getContract() {
        return _ref8.apply(this, arguments);
      }

      return getContract;
    }()
  }, {
    key: 'acceptBids',
    value: function () {
      var _ref9 = _asyncToGenerator(regeneratorRuntime.mark(function _callee9(bids, options) {
        var contract, bidSchema, totalBidValueAccepted, i, web3;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.next = 2;
                return _LoanContract2.default.instantiate(this.web3);

              case 2:
                contract = _context9.sent;


                options = options || { from: this.borrower };

                if (typeof options.gas === 'undefined') {
                  options.gas = UNDEFINED_GAS_ALLOWANCE;
                }

                bidSchema = new _BidSchema2.default(this.web3);
                totalBidValueAccepted = new this.web3.BigNumber(0);

                for (i = 0; i < bids.length; i++) {
                  bidSchema.validate(bids[i]);
                  totalBidValueAccepted = totalBidValueAccepted.plus(bids[i].amount);
                }

                if (totalBidValueAccepted.equals(this.principal.plus(this.attestorFee))) {
                  _context9.next = 10;
                  break;
                }

                throw new Error('Total value of bids accepted should equal the desired ' + "principal, plus the attestor's fee");

              case 10:

                // TODO: Fix issue around truffle-contract bugs when using call methods
                //    w/ non-default block numbers
                // const state = await this.getState(true);
                //
                // if (!state.equals(Constants.REVIEW_STATE)) {
                //   throw new Error('Bids can only be accepted during the review period.');
                // }

                web3 = this.web3;
                _context9.next = 13;
                return contract.acceptBids(this.uuid, bids.map(function (bid) {
                  return bid.bidder;
                }), bids.map(function (bid) {
                  return web3.toHex(bid.amount);
                }), options);

              case 13:
                return _context9.abrupt('return', _context9.sent);

              case 14:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function acceptBids(_x9, _x10) {
        return _ref9.apply(this, arguments);
      }

      return acceptBids;
    }()
  }, {
    key: 'rejectBids',
    value: function () {
      var _ref10 = _asyncToGenerator(regeneratorRuntime.mark(function _callee10(options) {
        var contract;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return _LoanContract2.default.instantiate(this.web3);

              case 2:
                contract = _context10.sent;


                options = options || { from: this.borrower };

                if (typeof options.gas === 'undefined') {
                  options.gas = UNDEFINED_GAS_ALLOWANCE;
                }

                // TODO: Fix issue around truffle-contract bugs when using call methods
                //    w/ non-default block numbers
                // const state = await this.getState(true);
                //
                // if (!state.equals(Constants.REVIEW_STATE)) {
                //   throw new Error('Bids can only be rejected during the review period.');
                // }

                _context10.next = 7;
                return contract.rejectBids(this.uuid, options);

              case 7:
                return _context10.abrupt('return', _context10.sent);

              case 8:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function rejectBids(_x11) {
        return _ref10.apply(this, arguments);
      }

      return rejectBids;
    }()
  }, {
    key: 'getState',
    value: function () {
      var _ref11 = _asyncToGenerator(regeneratorRuntime.mark(function _callee11() {
        var nextBlock = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var truffleContract, contract, blockNumber, uuid, state;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _context11.next = 2;
                return _LoanContract2.default.instantiate(this.web3);

              case 2:
                truffleContract = _context11.sent;
                contract = truffleContract.contract;
                blockNumber = void 0;

                if (!nextBlock) {
                  _context11.next = 10;
                  break;
                }

                _context11.next = 8;
                return _Util2.default.getLatestBlockNumber(this.web3);

              case 8:
                blockNumber = _context11.sent;

                blockNumber += 1;

              case 10:
                uuid = this.uuid;
                _context11.next = 13;
                return new Promise(function (resolve, reject) {
                  contract.getState.call(uuid, blockNumber, function (err, state) {
                    if (err) reject(err);else resolve(state);
                  });
                });

              case 13:
                state = _context11.sent;
                return _context11.abrupt('return', state);

              case 15:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function getState() {
        return _ref11.apply(this, arguments);
      }

      return getState;
    }()
  }, {
    key: 'getInterestRate',
    value: function () {
      var _ref12 = _asyncToGenerator(regeneratorRuntime.mark(function _callee12() {
        var contract;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                _context12.next = 2;
                return _LoanContract2.default.instantiate(this.web3);

              case 2:
                contract = _context12.sent;
                _context12.next = 5;
                return contract.getInterestRate.call(this.uuid);

              case 5:
                return _context12.abrupt('return', _context12.sent);

              case 6:
              case 'end':
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function getInterestRate() {
        return _ref12.apply(this, arguments);
      }

      return getInterestRate;
    }()
  }, {
    key: 'repay',
    value: function () {
      var _ref13 = _asyncToGenerator(regeneratorRuntime.mark(function _callee13(amount, options) {
        var contract;
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                _context13.next = 2;
                return _LoanContract2.default.instantiate(this.web3);

              case 2:
                contract = _context13.sent;


                options = options || { from: this.web3.eth.defaultAccount };

                options.value = amount;

                // TODO: Fix issue around truffle-contract bugs when using call methods
                //    w/ non-default block numbers
                // const state = await this.getState(true);
                //
                // if (!state.equals(Constants.ACCEPTED_STATE))
                //   throw new Error('Repayments cannot be made until loan term has begun.');

                return _context13.abrupt('return', contract.periodicRepayment(this.uuid, options));

              case 6:
              case 'end':
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function repay(_x13, _x14) {
        return _ref13.apply(this, arguments);
      }

      return repay;
    }()
  }, {
    key: 'withdrawInvestment',
    value: function () {
      var _ref14 = _asyncToGenerator(regeneratorRuntime.mark(function _callee14(options, callback) {
        var contract;
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                _context14.next = 2;
                return _LoanContract2.default.instantiate(this.web3);

              case 2:
                contract = _context14.sent;


                options = options || { from: this.web3.eth.defaultAccount };

                // TODO: Fix issue around truffle-contract bugs when using call methods
                //    w/ non-default block numbers
                // const state = await this.getState(true);
                // 
                // if (!state.equals(Constants.REJECTED_STATE) &&
                //       !state.equals(Constants.ACCEPTED_STATE)) {
                //   throw new Error('Bids can only be withdrawn once the loan has been ' +
                //     'accepted or rejected.');
                // }

                return _context14.abrupt('return', contract.withdrawInvestment(this.uuid, options));

              case 5:
              case 'end':
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function withdrawInvestment(_x15, _x16) {
        return _ref14.apply(this, arguments);
      }

      return withdrawInvestment;
    }()
  }, {
    key: 'amountRepaid',
    value: function () {
      var _ref15 = _asyncToGenerator(regeneratorRuntime.mark(function _callee15(options) {
        var contract;
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                _context15.next = 2;
                return _LoanContract2.default.instantiate(this.web3);

              case 2:
                contract = _context15.sent;


                options = options || { from: this.web3.eth.defaultAccount };

                return _context15.abrupt('return', contract.getAmountRepaid.call(this.uuid, options));

              case 5:
              case 'end':
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function amountRepaid(_x17) {
        return _ref15.apply(this, arguments);
      }

      return amountRepaid;
    }()
  }, {
    key: 'getRedeemableValue',
    value: function () {
      var _ref16 = _asyncToGenerator(regeneratorRuntime.mark(function _callee16(investor, options) {
        var contract;
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                _context16.next = 2;
                return _LoanContract2.default.instantiate(this.web3);

              case 2:
                contract = _context16.sent;


                options = options || { from: this.web3.eth.defaultAccount };

                return _context16.abrupt('return', contract.getRedeemableValue.call(this.uuid, investor, options));

              case 5:
              case 'end':
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function getRedeemableValue(_x18, _x19) {
        return _ref16.apply(this, arguments);
      }

      return getRedeemableValue;
    }()
  }, {
    key: 'signAttestation',
    value: function () {
      var _ref17 = _asyncToGenerator(regeneratorRuntime.mark(function _callee17() {
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                _context17.next = 2;
                return this.attestation.sign();

              case 2:
                this.signature = _context17.sent;

              case 3:
              case 'end':
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));

      function signAttestation() {
        return _ref17.apply(this, arguments);
      }

      return signAttestation;
    }()
  }, {
    key: 'verifyAttestation',
    value: function verifyAttestation() {
      var validSignature = this.attestation.verifySignature(this.signature);
      if (!validSignature) throw new Error('Attestation has invalid signature!');
    }
  }], [{
    key: 'create',
    value: function () {
      var _ref18 = _asyncToGenerator(regeneratorRuntime.mark(function _callee18(web3, params) {
        var loan, schema;
        return regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                loan = new Loan(web3, params);

                loan.web3 = web3;

                schema = new _LoanSchema2.default(web3);

                schema.validate(params);

                loan.uuid = params.uuid;
                loan.borrower = params.borrower;
                loan.principal = new web3.BigNumber(params.principal);
                loan.terms = new _Terms2.default(web3, params.terms);
                loan.attestor = params.attestor;
                loan.attestorFee = new web3.BigNumber(params.attestorFee);
                loan.defaultRisk = new web3.BigNumber(params.defaultRisk);
                loan.signature = params.signature;
                loan.auctionPeriodLength = new web3.BigNumber(params.auctionPeriodLength);
                loan.reviewPeriodLength = new web3.BigNumber(params.reviewPeriodLength);

                if (params.interestRate) loan.interestRate = new web3.BigNumber(params.interestRate);
                if (params.termBeginBlockNumber) loan.termBeginBlockNumber = new web3.BigNumber(params.termBeginBlockNumber);
                if (params.termBeginTimestamp) loan.termBeginTimestamp = new web3.BigNumber(params.termBeginTimestamp);
                if (params.auctionPeriodEndBlock) loan.auctionPeriodEndBlock = new web3.BigNumber(params.auctionPeriodEndBlock);
                if (params.reviewPeriodEndBlock) loan.reviewPeriodEndBlock = new web3.BigNumber(params.reviewPeriodEndBlock);

                loan.attestation = new _Attestation2.default(loan.web3, {
                  uuid: loan.uuid,
                  borrower: loan.borrower,
                  principal: loan.principal,
                  terms: loan.terms.toByteString(),
                  attestor: loan.attestor,
                  attestorFee: loan.attestorFee,
                  defaultRisk: loan.defaultRisk
                });

                if (loan.signature) loan.verifyAttestation();

                loan.events = new _Events2.default(web3, { uuid: loan.uuid });
                loan.servicing = new _Servicing2.default(loan);
                loan.stateListeners = new _StateListeners2.default(web3, loan);

                _context18.next = 26;
                return loan.stateListeners.refresh();

              case 26:
                return _context18.abrupt('return', loan);

              case 27:
              case 'end':
                return _context18.stop();
            }
          }
        }, _callee18, this);
      }));

      function create(_x20, _x21) {
        return _ref18.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: 'broadcast',
    value: function () {
      var _ref19 = _asyncToGenerator(regeneratorRuntime.mark(function _callee19(web3, params, options) {
        var loan;
        return regeneratorRuntime.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                _context19.next = 2;
                return Loan.create(web3, params);

              case 2:
                loan = _context19.sent;
                _context19.next = 5;
                return loan.broadcast(options);

              case 5:
              case 'end':
                return _context19.stop();
            }
          }
        }, _callee19, this);
      }));

      function broadcast(_x22, _x23, _x24) {
        return _ref19.apply(this, arguments);
      }

      return broadcast;
    }()
  }]);

  return Loan;
}(_RedeemableErc2.default);

module.exports = Loan;