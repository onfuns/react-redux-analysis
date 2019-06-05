import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from '../src'

let uid = 0

class Pages extends Component {

  onClick() {
    this.props.dispatch({ type: 'CLICK', reduxTestData: ++uid })
  }

  render() {
    console.log(this.props)
    return (
      <div>
        <button onClick={this.props.increment}>测试点击</button>
        <p>当前数据 {this.props.reduxTestData}</p>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  return { reduxTestData: state.main.reduxTestData }
}

const increment = () => ({ type: "CLICK", reduxTestData: ++uid })
// function
function mapDispatchToProps({ dispatch }) {
  //return { dispatch,{...bindActionCreators(increment,dispatch)} }
  return { dispatch, onClick: () => { console.log('click') } }
}

// plain object
const mapDispatchToPropsActions = { increment }

function mergeProps(state, dispatchActions, props) {
  return { ...state, ...dispatchActions, ...props, custom: 'custom' }
}

export default connect(mapStateToProps, mapDispatchToPropsActions, mergeProps)(Pages);