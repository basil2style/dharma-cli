'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _AttestationSchema = require('./schemas/AttestationSchema.js');

var _AttestationSchema2 = _interopRequireDefault(_AttestationSchema);

var _jsonStableStringify = require('json-stable-stringify');

var _jsonStableStringify2 = _interopRequireDefault(_jsonStableStringify);

var _Util = require('./Util.js');

var _Util2 = _interopRequireDefault(_Util);

var _ethereumjsUtil = require('ethereumjs-util');

var _ethereumjsUtil2 = _interopRequireDefault(_ethereumjsUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Attestation = function () {
  function Attestation(web3, data) {
    _classCallCheck(this, Attestation);

    this.web3 = web3;

    this.schema = new _AttestationSchema2.default(web3);
    this.schema.validate(data);

    this.attestor = data.attestor;
    this.data = data;
  }

  _createClass(Attestation, [{
    key: 'sign',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var web3, attestor, data;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                web3 = this.web3;
                attestor = this.attestor;
                data = web3.toHex((0, _jsonStableStringify2.default)(this.data));
                _context.next = 5;
                return new Promise(function (accept, reject) {
                  web3.eth.sign(attestor, data, function (err, signatureRaw) {
                    if (err) {
                      console.log(err);
                      reject(err);
                    } else {
                      var signature = _Util2.default.stripZeroEx(signatureRaw);
                      accept({
                        r: '0x' + signature.slice(0, 64),
                        s: '0x' + signature.slice(64, 128),
                        v: '0x' + signature.slice(128, 130)
                      });
                    }
                  });
                });

              case 5:
                return _context.abrupt('return', _context.sent);

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function sign() {
        return _ref.apply(this, arguments);
      }

      return sign;
    }()
  }, {
    key: 'verifySignature',
    value: function verifySignature(signature) {
      var web3 = this.web3;

      var r = _ethereumjsUtil2.default.toBuffer(signature.r);
      var s = _ethereumjsUtil2.default.toBuffer(signature.s);
      var v = this.web3.toDecimal(signature.v);

      if (v < 27) v += 27;

      var dataBuffer = _ethereumjsUtil2.default.toBuffer((0, _jsonStableStringify2.default)(this.data));
      var encodedMessage = _ethereumjsUtil2.default.hashPersonalMessage(dataBuffer);

      try {
        var pubKey = _ethereumjsUtil2.default.ecrecover(encodedMessage, v, r, s);
        var retrievedAddress = _ethereumjsUtil2.default.bufferToHex(_ethereumjsUtil2.default.pubToAddress(pubKey));

        return retrievedAddress === this.attestor;
      } catch (err) {
        return false;
      }
    }
  }], [{
    key: 'fromSignatureData',
    value: function fromSignatureData(web3, signature) {
      var v = _Util2.default.stripZeroEx(web3.toHex(signature[2]));

      return {
        r: signature[0],
        s: signature[1],
        v: '0x' + web3.padLeft(v, 2)
      };
    }
  }]);

  return Attestation;
}();

module.exports = Attestation;