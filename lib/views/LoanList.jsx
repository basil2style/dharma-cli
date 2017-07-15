import React, {Component} from 'react';

class LoanList extends Component {
  componentDidMount() {
    this.refs.list.setLabel("Loans Outstanding");
  }

  render() {
    const data = this.props.loans;

    return (
      <listtable
            ref="list"
            top="0"
           left="0"
           width="60%"
           height="60%"
           data={data}
           border={{type: 'line'}}
           noCellBorders="true"
           style={{border: {fg: 'cyan'}}}>
      </listtable>
    );
  }
}

module.exports = LoanList;
