const logs = (state = [], action) => {
  switch (action.type) {
    case 'LOG_MESSAGE':
      return action.message;
      break;
    default:
      return null;
  }
}

export default logs
