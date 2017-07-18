import { combineReducers } from 'redux'
import loans from './loans'
import bids from './bids'
import visibleTerms from './visibleTerms';
import logs from './logs';

const dashboardApp = combineReducers({
  loans,
  bids,
  visibleTerms,
  logs
})

export default dashboardApp
