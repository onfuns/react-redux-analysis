import React from 'react'

/**
 * 创建一个新的Context对象。当React渲染一个组件，
 * 且该组件注册了Context时，它将读取父组件中，
 * 距离该组件最近的Provider组件的Context值
 */
export const ReactReduxContext = React.createContext(null)

export default ReactReduxContext
