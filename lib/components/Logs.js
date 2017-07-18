import blessed from 'blessed';
import contrib from 'blessed-contrib';
import _ from 'lodash';

const logStyle = {
  top: '60%',
  left: 0,
  width: '30%',
  height: '30%',
  label: 'Logs',
  border: {
    type: 'line',
    fg: 'cyan'
  },
  style: {
    fg: '#007f00'
  },
  tags: true
}

class Logs {
  constructor() {
    this.log = contrib.log(logStyle)
  }

  getNode() {
    return this.log;
  }

  render(message) {
    if (message)
      this.log.log(message);
  }
}

module.exports = Logs;
