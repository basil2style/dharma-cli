import { combineReducers } from 'redux'
import loans from './loans'
import bids from './bids'

const dashboardApp = combineReducers({
  loans,
  bids
})

export default dashboardApp
