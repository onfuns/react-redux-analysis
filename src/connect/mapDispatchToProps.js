import { bindActionCreators } from 'redux'
import { wrapMapToPropsConstant, wrapMapToPropsFunc } from './wrapMapToProps'

export function whenMapDispatchToPropsIsFunction(mapDispatchToProps) {
  return typeof mapDispatchToProps === 'function'
    ? wrapMapToPropsFunc(mapDispatchToProps, 'mapDispatchToProps')
    : undefined
}

export function whenMapDispatchToPropsIsMissing(mapDispatchToProps) {
  //如果mapDispatchToProps为null ，直接返回 dispatch
  return !mapDispatchToProps
    ? wrapMapToPropsConstant(dispatch => ({ dispatch })) //会生成(dispatch, options)=>()=>({dispatch})
    : undefined
}

export function whenMapDispatchToPropsIsObject(mapDispatchToProps) {
  //如果mapDispatchToProps为对象 类似 { ()=> ({ type:'CLICK' })} ，则使用redux提供的bindActionCreators函数包裹dispatch
  return mapDispatchToProps && typeof mapDispatchToProps === 'object'
    ? wrapMapToPropsConstant(dispatch =>  //会生成(dispatch, options)=>()=>bindActionCreators(mapDispatchToProps, dispatch)，也就是绑定过dispatch的actions
      bindActionCreators(mapDispatchToProps, dispatch)
    )
    : undefined
}

export default [
  whenMapDispatchToPropsIsFunction,
  whenMapDispatchToPropsIsMissing,
  whenMapDispatchToPropsIsObject
]
