import { combineReducers } from 'redux'
import investments from './investments'
import visibleTerms from './visibleTerms';
import logs from './logs';
import totalCash from './totalCash';
import portfolioSummary from './portfolioSummary';

const dashboardApp = combineReducers({
  investments,
  visibleTerms,
  logs,
  totalCash,
  portfolioSummary
})

export default dashboardApp
