import blessed from 'blessed';

const boxStyle = {
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
  },
}

const cashLabelStyle = {
  style: {
    fg: 'white'
  },
  top: '25%-1',
  left: 'center',
  content: 'Total Cash Available:',
}

const cashTextStyle = {
  style: {
    fg: 'cyan'
  },
  left: 'center',
  top: '25%'
}

const addressLabelStyle = {
  style: {
    fg: 'white'
  },
  top: '50%-1',
  left: 'center',
  content: 'Dharma Testnet Address:',
}

const addressTextStyle = {
  style: {
    fg: 'green'
  },
  left: 'center',
  width: '770',
  top: '50%'
}

const disclaimerLabelStyle = {
  left: 'center',
  align: 'center',
  content: 'Warning: do not send funds to address on Mainnet!',
  top: '70%',
  style: {
    fg: 'red',
  }
}

class CashAvailable {
  constructor() {
    this.wrapper = blessed.box(boxStyle)
    this.cashLabel = blessed.text(cashLabelStyle);
    this.cashText = blessed.text(cashTextStyle);
    this.addressLabel = blessed.text(addressLabelStyle);
    this.addressText = blessed.text(addressTextStyle)
    this.disclaimerLabel = blessed.text(disclaimerLabelStyle);
    // this.addressText = blessed.text(addressTextStyle)
    this.wrapper.append(this.cashLabel);
    this.wrapper.append(this.cashText);
    this.wrapper.append(this.addressLabel);
    this.wrapper.append(this.addressText);
    this.wrapper.append(this.disclaimerLabel);

    // this.wrapper.append(this.addressText);
  }

  getNode() {
    return this.wrapper;
  }

  render(totalCash, address) {
    this.cashText.setContent('\u039E' + totalCash.toFixed(4))
    this.addressText.setContent(address);
    // this.addressText.setContent(address);
  }
}

module.exports = CashAvailable;
