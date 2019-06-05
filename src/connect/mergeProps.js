import verifyPlainObject from '../utils/verifyPlainObject'

export function defaultMergeProps(stateProps, dispatchProps, ownProps) {
  return { ...ownProps, ...stateProps, ...dispatchProps }
}

export function wrapMergePropsFunc(mergeProps) {
  return function initMergePropsProxy(
    dispatch,
    { displayName, pure, areMergedPropsEqual }
  ) {
    let hasRunOnce = false
    let mergedProps

    return function mergePropsProxy(stateProps, dispatchProps, ownProps) {
      //mergeProps 返回的是合并后的props对象
      const nextMergedProps = mergeProps(stateProps, dispatchProps, ownProps)
      //如果是首次加载
      if (hasRunOnce) {
        //如果不是纯净组件 或者 没有自定义areMergedPropsEqual，则合并后的mergedProps 为nextMergedProps
        if (!pure || !areMergedPropsEqual(nextMergedProps, mergedProps))
          mergedProps = nextMergedProps
      } else {//不是首次加载 不需要判断是否是纯净组件，因为传入pure不会变，不用判断areMergedPropsEqual浪费性能
        hasRunOnce = true
        mergedProps = nextMergedProps

        if (process.env.NODE_ENV !== 'production')
          verifyPlainObject(mergedProps, displayName, 'mergeProps')
      }

      return mergedProps
    }
  }
}

export function whenMergePropsIsFunction(mergeProps) {
  //如果mergeProps 定义 且是函数 
  return typeof mergeProps === 'function'
    ? wrapMergePropsFunc(mergeProps)
    : undefined
}

export function whenMergePropsIsOmitted(mergeProps) {
  //如果mergeProps 不存在，则合并 store中state 及dispatchProps和自有props
  return !mergeProps ? () => defaultMergeProps : undefined
}

export default [whenMergePropsIsFunction, whenMergePropsIsOmitted]
