import {Injectable, Resolver} from './container'
import DEPENDENCY_CONTEXT, {DependencyContext} from './dependency-context'

import * as React from 'react'

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

export interface ComponentDependencies {
  [key: string]: Injectable
}

type DependencyList<D extends ComponentDependencies> = {
  [Key in keyof D]: string
}

export interface WithDependencies<D extends ComponentDependencies> {
  deps: D
}

interface DependencyProviderProps<D extends ComponentDependencies, P extends WithDependencies<D>> {
  resolver: Resolver
  dependencies: DependencyList<D>
  passedProps: Omit<P, keyof WithDependencies<D>>
  wrappedComponent: React.ComponentType<P>
}

export class DependencyProvider<D extends ComponentDependencies, P extends WithDependencies<D>>
  extends React.Component<DependencyProviderProps<D, P>> {

  readonly deps: D

  constructor(props: DependencyProviderProps<D, P>) {
    super(props)

    const deps: D = {} as D
    const {resolver, dependencies, wrappedComponent} = this.props

    for (const key in dependencies) {

      if (dependencies.hasOwnProperty(key)) {
        const identifier = dependencies[key]

        deps[key] = resolver.resolve(identifier, wrappedComponent.name)
      }
    }

    this.deps = deps
  }

  render() {

    const passedProps = this.props.passedProps
    const WrappedComponent = this.props.wrappedComponent

    const props: P = {
      deps: this.deps,
      ...passedProps
    } as P

    return (<WrappedComponent {...props} />)
  }
}

export const withDependencies =
  <D extends ComponentDependencies>(dependencies: DependencyList<D>):
    <P extends WithDependencies<D>>(WrappedComponent: React.ComponentType<P>) =>
      React.ComponentType<Omit<P, keyof WithDependencies<D>>> => {

    return <P extends WithDependencies<D>>(WrappedComponent: React.ComponentType<P>):
      React.ComponentType<Omit<P, keyof WithDependencies<D>>> => {

      return (props: Omit<P, keyof WithDependencies<D>>) => {
        return (
          <DEPENDENCY_CONTEXT.Consumer>
            {(value: DependencyContext | null) => (
              <DependencyProvider
                resolver={value!.resolver}
                dependencies={dependencies}
                passedProps={props}
                wrappedComponent={WrappedComponent}
              />
            )}
          </DEPENDENCY_CONTEXT.Consumer>
        )
      }
    }
  }
