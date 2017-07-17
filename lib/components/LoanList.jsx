import React, {Component} from 'react';

const headerStyle = {
  bg: 'cyan'
}

const cellStyle = {
  fg: 'green'
}

const selectedItemStyle = {
  bg: 'red'
}

class LoanList extends Component {
  componentDidMount() {
    this.refs.list.setLabel("Loans Outstanding");
  }

  render() {
    const header = ['UUID', 'BORROWER', 'PRINCIPAL', 'INTEREST', 'ATTESTOR', 'ATTESTOR FEE', 'DEFAULT RISK']
    const loans = this.props.loans;

    const data =  [header, ...loans];

    return (
      <listtable
            ref="list"
            top="0"
           left="0"
           width="60%"
           height="60%"
           align='left'
           padding={{left: 2, right: 2, top: 1}}
           rows={data}
           mouse={true}
           keys={true}
           keyable={true}
           focused={true}
           border={{type: 'line'}}
           noCellBorders={true}
           style={{fg: 'green', border: {fg: 'cyan'}, header: headerStyle, cell: cellStyle, selected: selectedItemStyle}}>
      </listtable>
    );
  }
}

module.exports = LoanList;
