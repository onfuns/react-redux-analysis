import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Route, BrowserRouter as RouterContainer } from 'react-router-dom'
import { Provider } from '../src'
import { configureStore } from './configureStore'
import Pages from './page'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      store: configureStore()
    }
  }


  render() {
    return (
      <Provider store={this.state.store}>
        <RouterContainer>
          <Route path="/" component={Pages} />
        </RouterContainer>
      </Provider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'))