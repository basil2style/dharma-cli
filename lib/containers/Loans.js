import LoanList from '../components/LoanList';
import { connect } from 'react-redux'
import LoanDecorator from '../decorators/LoanDecorator';

function loansOutstanding(loans) {
  let loanList = []
  loans.forEach((loan) => {
    const decorator = new LoanDecorator(loan);
    loanList.push([
      decorator.uuid(),
      decorator.borrower(),
      decorator.principal(),
      decorator.interestRate(),
      decorator.attestor(),
      decorator.attestorFee(),
      decorator.defaultRisk()
    ])
  })

  return loanList;
}

const mapStateToProps = state => {
  return {
    loans: loansOutstanding(state.loans)
  }
}

const mapDispatchToProps = dispatch => {
  return {

  }
}

const Loans = connect(
  mapStateToProps,
  mapDispatchToProps
)(LoanList)

export default Loans
