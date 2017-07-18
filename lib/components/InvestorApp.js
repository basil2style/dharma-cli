import dashboardApp from '../reducers';
import { createStore } from 'redux';
import LoansOutstanding from './LoansOutstanding';
import Terms from './Terms';
import Logs from './Logs';
import blessed from 'blessed';
import { displayTerms } from '../actions/actions';

class InvestorApp {
  constructor(investor) {
    this.investor = investor;

    this.onLoanSelect = this.onLoanSelect.bind(this);
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

    this.loansOutstanding = new LoansOutstanding(this.onLoanSelect);
    this.terms = new Terms();
    this.logs = new Logs();

    // Adding a way to quit the program
    this.screen.key(['escape', 'q', 'C-c'], this.exit);

    this.screen.append(this.loansOutstanding.getNode());
    this.screen.append(this.terms.getNode());
    this.screen.append(this.logs.getNode());

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
    this.terms.render(state.visibleTerms, state.loans);
    this.logs.render(state.logs);
    this.screen.render();
  }

  onLoanSelect(index) {
    this.store.dispatch(displayTerms(index));

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
