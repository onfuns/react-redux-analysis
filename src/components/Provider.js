import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ReactReduxContext } from './Context' // 引入 React.createContext

class Provider extends Component {
  constructor(props) {
    super(props)

    // 获取sore , store 通过 <Provider store={storre}></Provider>传入
    const { store } = props

    this.state = {
      storeState: store.getState(), //获取store中数据
      store //保存初始的store 
    }
  }

  componentDidMount() {
    this._isMounted = true //是否挂载
    this.subscribe() //订阅
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe() //如果已经订阅过，则移除订阅

    this._isMounted = false //将挂载标志归为 false
  }

  componentDidUpdate(prevProps) {
    if (this.props.store !== prevProps.store) { //如果store有变化，则重新订阅
      if (this.unsubscribe) this.unsubscribe() // 如果已经订阅过 则先移除订阅

      this.subscribe()
    }
  }

  subscribe() { //订阅
    const { store } = this.props
    //订阅store变化，store.subscribe是redex中createStore的方法
    this.unsubscribe = store.subscribe(() => {
      const newStoreState = store.getState()

      if (!this._isMounted) { //未挂载则退出
        return
      }

      this.setState(providerState => {
        // If the value is the same, skip the unnecessary state update.
        //如果store一致，则忽略更新
        if (providerState.storeState === newStoreState) {
          return null
        }

        return { storeState: newStoreState }
      })
    })

    // Actions might have been dispatched between render and mount - handle those
    //Actions 可能在render和 mount之间触发，所以判断storeState 是否一致，不一致则重新赋值
    const postMountStoreState = store.getState()
    if (postMountStoreState !== this.state.storeState) {
      this.setState({ storeState: postMountStoreState })
    }
  }

  render() {
    const Context = this.props.context || ReactReduxContext

    //用react context 将storeState, state传入子组件,Provider可以使得Consumer组件监听context的变更
    return (
      <Context.Provider value={this.state}>
        {this.props.children}
      </Context.Provider>
    )
  }
}

Provider.propTypes = {
  store: PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired
  }),
  context: PropTypes.object,
  children: PropTypes.any
}

export default Provider
