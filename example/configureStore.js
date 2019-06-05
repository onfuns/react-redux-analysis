import { applyMiddleware, createStore, compose } from 'redux'

import reducers from './reducers'


const middleware = []
const createWeSiteStore = applyMiddleware(...middleware)


function configureStore() {
  const store = createStore(reducers, compose(createWeSiteStore))
  return store
}

export { configureStore }