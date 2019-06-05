import { wrapMapToPropsConstant, wrapMapToPropsFunc } from './wrapMapToProps'

export function whenMapStateToPropsIsFunction(mapStateToProps) {
  return typeof mapStateToProps === 'function'
    ? wrapMapToPropsFunc(mapStateToProps, 'mapStateToProps')
    : undefined
}

//connect.js 中match 函数倒序遍历先执行这个函数， 
//如果mapStateToProps 为空则 返回wrapMapToPropsConstant 执行结果,否则继续执行 whenMapStateToPropsIsFunction
//mapStateToProps 为空意味着不监听 store变化
export function whenMapStateToPropsIsMissing(mapStateToProps) {
  return !mapStateToProps ? wrapMapToPropsConstant(() => ({})) : undefined
}

export default [whenMapStateToPropsIsFunction, whenMapStateToPropsIsMissing]
