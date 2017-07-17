import dashboardApp from '../reducers';
import { createStore } from 'redux';
import LoansOutstanding from './LoansOutstanding';
import blessed from 'blessed';

class InvestorApp {
  constructor(investor) {
    this.investor = investor;

    this.onStateChange = this.onStateChange.bind(this);
    this.errorCallback = this.errorCallback.bind(this);
    this.exit = this.exit.bind(this);
  }

  async start() {
    this.store = createStore(dashboardApp);
    this.store.subscribe(this.onStateChange);

    // Creating our screen
    this.screen = blessed.screen({
      autoPadding: true,
      smartCSR: true,
    });

    this.loansOutstanding = new LoansOutstanding();

    // Adding a way to quit the program
    this.screen.key(['escape', 'q', 'C-c'], this.exit);

    this.screen.append(this.loansOutstanding.getNode());
    this.screen.render();
    this.screen.enableKeys();

    try {
      await this.investor.startDaemon(this.store, this.errorCallback);
    } catch (err) {
      console.error(err.stack);
    }
  }

  onStateChange() {
    const state = this.store.getState();
    this.loansOutstanding.render(state.loans);
    this.screen.render();
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
    }, 200);
  }
}

module.exports = InvestorApp;
