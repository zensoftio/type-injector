import * as React from 'react'
import {Container, Resolver} from './container'
import DEPENDENCY_CONTEXT from './dependency-context'

interface Props {
  resolver?: Resolver
  children?: React.ReactNode | React.ReactNodeArray
}

export const ContainerProvider = (props: Props) => {

  return (
    <DEPENDENCY_CONTEXT.Provider value={{resolver: props.resolver || Container.defaultContainer}}>
      {props.children}
    </DEPENDENCY_CONTEXT.Provider>
  )
}
