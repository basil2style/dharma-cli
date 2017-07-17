import React from 'react'
import { render } from 'react-blessed'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import dashboardApp from '../reducers'
import Dashboard from './Dashboard'
import blessed from 'blessed';

class InvestorApp {
  constructor(investor) {
    this.investor = investor;

    this.errorCallback = this.errorCallback.bind(this);
    this.exit = this.exit.bind(this);
  }

  async start() {
    let store = createStore(dashboardApp)

    try {
      await this.investor.startDaemon(store, this.errorCallback);
    } catch (err) {
      console.error(err.stack);
    }

    // Creating our screen
    this.screen = blessed.screen({
      autoPadding: true,
      smartCSR: true,
      title: 'react-blessed hello world'
    });

    // Adding a way to quit the program
    this.screen.key(['escape', 'q', 'C-c'], this.exit);

    render(
      <Provider store={store}>
        <Dashboard />
      </Provider>,
      this.screen
    )
  }

  async errorCallback(err) {
    await this.investor.stopDaemon();
    this.screen.destroy();
    console.log(err)
    setTimeout(() => {
      process.exit(1)
    }, 200);
  }

  async exit() {
    await this.investor.stopDaemon();
    setTimeout(() => {
      process.exit(0)
    }, 1000);
  }
}

module.exports = InvestorApp;
