import { combineReducers } from 'redux'
import investments from './investments'
import visibleTerms from './visibleTerms';
import logs from './logs';
import totalCash from './totalCash';

const dashboardApp = combineReducers({
  investments,
  visibleTerms,
  logs,
  totalCash
})

export default dashboardApp
