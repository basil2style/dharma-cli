import _ from 'lodash';

const investments = (state = [], action) => {
  switch (action.type) {
    case 'INIT_STATE':
      const portfolio = action.portfolio;
      return Object.keys(portfolio).map((uuid) => {
        const investment = portfolio[uuid];
        return investment;
      })
      break;
    case 'ADD_INVESTMENT':
      return [
        ...state,
        action.investment
      ]
      break;
    case 'UPDATE_INVESTMENT':
      const remainingInvestments = _.remove(state, (investment) => {
        investment.loan.uuid === action.investment.loan.uuid
      })

      return [
        ...remainingInvestments,
        action.investment
      ];
      break;
    default:
      return state
  }
}

export default investments
