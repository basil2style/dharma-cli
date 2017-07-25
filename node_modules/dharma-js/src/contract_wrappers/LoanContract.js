'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _truffleContract = require('truffle-contract');

var _truffleContract2 = _interopRequireDefault(_truffleContract);

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

var _Loan = require('../../contracts/Loan.json');

var _Loan2 = _interopRequireDefault(_Loan);

var _VersionRegister = require('../../contracts/VersionRegister.json');

var _VersionRegister2 = _interopRequireDefault(_VersionRegister);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LoanContract = function () {
  function LoanContract() {
    _classCallCheck(this, LoanContract);
  }

  _createClass(LoanContract, null, [{
    key: 'instantiate',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(web3) {
        var metadata = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _package2.default;
        var VersionRegister, Loan, versionRegisterInstance, contractVersion, localVersion, loanContractAddress;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                VersionRegister = new _truffleContract2.default(_VersionRegister2.default);
                Loan = new _truffleContract2.default(_Loan2.default);


                VersionRegister.defaults({ from: web3.eth.defaultAccount });
                Loan.defaults({ from: web3.eth.defaultAccount });

                VersionRegister.setProvider(web3.currentProvider);
                Loan.setProvider(web3.currentProvider);

                _context.next = 8;
                return VersionRegister.deployed();

              case 8:
                versionRegisterInstance = _context.sent;
                _context.next = 11;
                return versionRegisterInstance.currentVersion.call();

              case 11:
                contractVersion = _context.sent;
                localVersion = {
                  major: 0,
                  minor: 1,
                  patch: 0
                };

                if (!(contractVersion[0] != localVersion.major || contractVersion[1] != localVersion.minor || contractVersion[2] != localVersion.patch)) {
                  _context.next = 15;
                  break;
                }

                throw new Error('This version of dharma.js is trying to access a ' + 'deprecated version of the Dharma Protocol contract.  This can ' + 'be resolved by upgrading the dharma.js package.');

              case 15:
                _context.next = 17;
                return versionRegisterInstance.getContractByVersion.call(localVersion.major, localVersion.minor, localVersion.patch);

              case 17:
                loanContractAddress = _context.sent;
                _context.next = 20;
                return Loan.deployed();

              case 20:
                return _context.abrupt('return', _context.sent);

              case 21:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function instantiate(_x) {
        return _ref.apply(this, arguments);
      }

      return instantiate;
    }()
  }]);

  return LoanContract;
}();

module.exports = LoanContract;