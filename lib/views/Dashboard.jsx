import React, {Component} from 'react';
import LoanList from './LoanList';

// Rendering a simple centered box
class Dashboard extends Component {
  constructor(loans) {
    super()
    this.loans = loans;
  }

  render() {
    return (
      <LoanList loans={this.props.loans} />
    );
  }
}

module.exports = Dashboard;
