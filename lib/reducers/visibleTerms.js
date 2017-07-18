const visibleTerms = (state = [], action) => {
  switch (action.type) {
    case 'DISPLAY_TERMS':
      return action.index;
      break;
    case 'INIT_STATE':
      return 0;
      break;
    default:
      return state
  }
}

export default visibleTerms
