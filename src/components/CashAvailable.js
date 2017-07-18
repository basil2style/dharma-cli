'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _blessed = require('blessed');

var _blessed2 = _interopRequireDefault(_blessed);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var boxStyle = {
  top: '60%',
  left: '70%',
  width: '30%',
  height: '30%',
  label: 'Total Cash',
  border: {
    type: 'line',
    fg: 'cyan'
  },
  style: {
    fg: '#007f00'
  }
};

var cashLabelStyle = {
  style: {
    fg: 'white'
  },
  top: '25%-1',
  left: 'center',
  content: 'Total Cash Available:'
};

var cashTextStyle = {
  style: {
    fg: 'cyan'
  },
  left: 'center',
  top: '25%'
};

var addressLabelStyle = {
  style: {
    fg: 'white'
  },
  top: '50%-1',
  left: 'center',
  content: 'Ropsten Testnet Address:'
};

var addressTextStyle = {
  style: {
    fg: 'green'
  },
  left: 'center',
  width: '770',
  top: '50%'
};

var disclaimerLabelStyle = {
  left: 'center',
  align: 'center',
  content: 'Warning: do not send funds to address on Mainnet!',
  top: '70%',
  style: {
    fg: 'red'
  }
};

var CashAvailable = function () {
  function CashAvailable() {
    _classCallCheck(this, CashAvailable);

    this.wrapper = _blessed2.default.box(boxStyle);
    this.cashLabel = _blessed2.default.text(cashLabelStyle);
    this.cashText = _blessed2.default.text(cashTextStyle);
    this.addressLabel = _blessed2.default.text(addressLabelStyle);
    this.addressText = _blessed2.default.text(addressTextStyle);
    this.disclaimerLabel = _blessed2.default.text(disclaimerLabelStyle);
    // this.addressText = blessed.text(addressTextStyle)
    this.wrapper.append(this.cashLabel);
    this.wrapper.append(this.cashText);
    this.wrapper.append(this.addressLabel);
    this.wrapper.append(this.addressText);
    this.wrapper.append(this.disclaimerLabel);

    // this.wrapper.append(this.addressText);
  }

  _createClass(CashAvailable, [{
    key: 'getNode',
    value: function getNode() {
      return this.wrapper;
    }
  }, {
    key: 'render',
    value: function render(totalCash, address) {
      this.cashText.setContent('\u039E' + totalCash.toFixed(4));
      this.addressText.setContent(address);
      // this.addressText.setContent(address);
    }
  }]);

  return CashAvailable;
}();

module.exports = CashAvailable;