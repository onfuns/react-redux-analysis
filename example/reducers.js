const { combineReducers } = require('redux')
function main(state = {}, action) {
  if (action.type === 'CLICK') {
    return {
      ...state,
      reduxTestData: action.reduxTestData
    }
  } else {
    return state
  }
}

export default combineReducers({
  main
})
