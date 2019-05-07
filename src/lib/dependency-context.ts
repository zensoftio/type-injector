import * as React from 'react'
import {Resolver} from './container'

export interface DependencyContext {
  resolver: Resolver
}

const DEPENDENCY_CONTEXT = React.createContext<DependencyContext | null>(null)

export default DEPENDENCY_CONTEXT
