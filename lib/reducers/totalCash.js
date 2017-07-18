const totalCash = (state = 0, action) => {
  switch (action.type) {
    case 'UPDATE_TOTAL_CASH':
      return action.totalCash;
      break;
    default:
      return state;
  }
}

export default totalCash
