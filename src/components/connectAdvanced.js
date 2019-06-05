//这个组件会自动把所有绑定在对象上的非React方法都绑定到新的对象上
import hoistStatics from 'hoist-non-react-statics'
//提示。类似console
import invariant from 'invariant'
import React, { Component, PureComponent } from 'react'
import { isValidElementType, isContextConsumer } from 'react-is'

import { ReactReduxContext } from './Context'

//字符串序列化组件
const stringifyComponent = Comp => {
  try {
    return JSON.stringify(Comp)
  } catch (err) {
    return String(Comp)
  }
}

//将 React 组件连接到 Redux store 的函数
export default function connectAdvanced(
  /*
    selectorFactory is a func that is responsible for returning the selector function used to
    compute new props from state, props, and dispatch. For example:

      export default connectAdvanced((dispatch, options) => (state, props) => ({
        thing: state.things[props.thingId],
        saveThing: fields => dispatch(actionCreators.saveThing(props.thingId, fields)),
      }))(YourComponent)

    Access to dispatch is provided to the factory so selectorFactories can bind actionCreators
    outside of their selector as an optimization. Options passed to connectAdvanced are passed to
    the selectorFactory, along with displayName and WrappedComponent, as the second argument.

    Note that selectorFactory is responsible for all caching/memoization of inbound and outbound
    props. Do not use connectAdvanced directly without memoizing results between calls to your
    selector, otherwise the Connect component will re-render on every state or props change.
  */
  selectorFactory,
  // options object:
  {
    // the func used to compute this HOC's displayName from the wrapped component's displayName.
    // probably overridden by wrapper functions such as connect()
    // 被包裹的组件的 DisplayName 属性
    getDisplayName = name => `ConnectAdvanced(${name})`,

    // shown in error messages
    // probably overridden by wrapper functions such as connect()
    // 在错误信息里显示的方法名称
    methodName = 'connectAdvanced',

    // REMOVED: if defined, the name of the property passed to the wrapped element indicating the number of
    // calls to render. useful for watching in react devtools for unnecessary re-renders.
    //被移除，表示render方法调用次数
    renderCountProp = undefined,

    // determines whether this HOC subscribes to store changes
    // 组件是否订阅 redux store 的 state 更改，默认true
    shouldHandleStateChanges = true,

    // REMOVED: the key of props/context to get the store
    storeKey = 'store',

    // REMOVED: expose the wrapped component via refs
    withRef = false,

    // use React's forwardRef to expose a ref of the wrapped component
    forwardRef = false,

    // the context consumer to use
    context = ReactReduxContext,

    // additional options are passed through to the selectorFactory
    ...connectOptions
  } = {}
) {
  //renderCountProp 被移除提示语
  invariant(
    renderCountProp === undefined,
    `renderCountProp is removed. render counting is built into the latest React dev tools profiling extension`
  )
  //withRef 被移除提示语
  invariant(
    !withRef,
    'withRef is removed. To access the wrapped instance, use a ref on the connected component'
  )

  const customStoreWarningMessage =
    'To use a custom Redux store for specific components, create a custom React context with ' +
    "React.createContext(), and pass the context object to React Redux's Provider and specific components" +
    ' like: <Provider context={MyContext}><ConnectedComponent context={MyContext} /></Provider>. ' +
    'You may also pass a {context : MyContext} option to connect'
  //storeKey 被移除提示语
  invariant(
    storeKey === 'store',
    'storeKey has been removed and does not do anything. ' +
    customStoreWarningMessage
  )

  const Context = context //将ReactReduxContext 赋值给Context
  //返回包裹组件的函数
  return function wrapWithConnect(WrappedComponent) {
    //如果是开发环境 且被包裹组件是不有效的元素则提示
    if (process.env.NODE_ENV !== 'production') {
      invariant(
        isValidElementType(WrappedComponent),
        `You must pass a component to the function returned by ` +
        `${methodName}. Instead received ${stringifyComponent(
          WrappedComponent
        )}`
      )
    }

    const wrappedComponentName =
      WrappedComponent.displayName || WrappedComponent.name || 'Component'

    const displayName = getDisplayName(wrappedComponentName)

    const selectorFactoryOptions = {
      ...connectOptions,
      getDisplayName,
      methodName,
      renderCountProp,
      shouldHandleStateChanges,
      storeKey,
      displayName,
      wrappedComponentName,
      WrappedComponent
    }

    const { pure } = connectOptions //pure 决定 shouldComponentUpdate是否比对

    let OuterBaseComponent = Component

    if (pure) {
      OuterBaseComponent = PureComponent
    }

    function makeDerivedPropsSelector() {
      let lastProps
      let lastState
      let lastDerivedProps
      let lastStore
      let lastSelectorFactoryOptions
      let sourceSelector

      return function selectDerivedProps(
        state,
        props,
        store,
        selectorFactoryOptions
      ) {// 如果pure为true , props 和 state都没有变化时 返回lastDerivedProps
        if (pure && lastProps === props && lastState === state) {
          return lastDerivedProps
        }
        //如果 store更新 或者 selectorFactoryOptions引用改变，则更新 lastStore 和 lastSelectorFactoryOptions
        if (
          store !== lastStore ||
          lastSelectorFactoryOptions !== selectorFactoryOptions
        ) {
          lastStore = store
          lastSelectorFactoryOptions = selectorFactoryOptions
          //selectorFactory为connect传入的function
          sourceSelector = selectorFactory(
            store.dispatch,
            selectorFactoryOptions
          )
        }

        lastProps = props
        lastState = state
        //合并 state ,props
        const nextProps = sourceSelector(state, props)

        lastDerivedProps = nextProps
        return lastDerivedProps
      }
    }

    function makeChildElementSelector() {
      let lastChildProps, lastForwardRef, lastChildElement, lastComponent

      return function selectChildElement(
        WrappedComponent,
        childProps,
        forwardRef
      ) {
        if ( //如果更新则赋值
          childProps !== lastChildProps ||
          forwardRef !== lastForwardRef ||
          lastComponent !== WrappedComponent
        ) {
          lastChildProps = childProps
          lastForwardRef = forwardRef
          lastComponent = WrappedComponent
          lastChildElement = (
            <WrappedComponent {...childProps} ref={forwardRef} />
          )
        }

        return lastChildElement
      }
    }

    class Connect extends OuterBaseComponent {
      constructor(props) {
        super(props)
        invariant(
          forwardRef ? !props.wrapperProps[storeKey] : !props[storeKey],
          'Passing redux store in props has been removed and does not do anything. ' +
          customStoreWarningMessage
        )
        this.selectDerivedProps = makeDerivedPropsSelector()
        this.selectChildElement = makeChildElementSelector()
        this.indirectRenderWrappedComponent = this.indirectRenderWrappedComponent.bind(
          this
        )
      }

      // value 是传入的 react context
      indirectRenderWrappedComponent(value) {
        // calling renderWrappedComponent on prototype from indirectRenderWrappedComponent bound to `this`
        return this.renderWrappedComponent(value)
      }

      renderWrappedComponent(value) {
        invariant(
          value,
          `Could not find "store" in the context of ` +
          `"${displayName}". Either wrap the root component in a <Provider>, ` +
          `or pass a custom React context provider to <Provider> and the corresponding ` +
          `React context consumer to ${displayName} in connect options.`
        )

        // 从 Provider store={store} 中取出的 数据
        const { storeState, store } = value

        let wrapperProps = this.props
        let forwardedRef

        if (forwardRef) {
          wrapperProps = this.props.wrapperProps
          forwardedRef = this.props.forwardedRef
        }

        let derivedProps = this.selectDerivedProps(
          storeState,
          wrapperProps,
          store,
          selectorFactoryOptions
        )

        return this.selectChildElement(
          WrappedComponent,
          derivedProps,
          forwardedRef
        )
      }

      render() {
        const ContextToUse =
          this.props.context &&
            this.props.context.Consumer &&
            isContextConsumer(<this.props.context.Consumer />)
            ? this.props.context
            : Context

        return (
          <ContextToUse.Consumer>
            {this.indirectRenderWrappedComponent}
          </ContextToUse.Consumer>
        )
      }
    }

    Connect.WrappedComponent = WrappedComponent
    Connect.displayName = displayName

    if (forwardRef) {
      const forwarded = React.forwardRef(function forwardConnectRef(
        props,
        ref
      ) {
        return <Connect wrapperProps={props} forwardedRef={ref} />
      })
      // 此时connect()(<xx />)的生成组件为forwarded， 重新挂载displayName和WrappedComponent
      forwarded.displayName = displayName
      forwarded.WrappedComponent = WrappedComponent
      return hoistStatics(forwarded, WrappedComponent)
    }
    // 将子组件的非React的static(静态)属性或方法合并到父组件
    return hoistStatics(Connect, WrappedComponent)
  }
}
