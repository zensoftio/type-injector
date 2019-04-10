import {Container, Injectable} from './dependency-container'
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

export const withDependencies =
  <D extends ComponentDependencies>(dependencies: DependencyList<D>, container: Container = Container.defaultContainer):
    <P extends WithDependencies<D>>(WrappedComponent: React.ComponentType<P>) =>
      React.ComponentClass<Omit<P, keyof WithDependencies<D>>> => {

    return <P extends WithDependencies<D>>(WrappedComponent: React.ComponentType<P>):
      React.ComponentClass<Omit<P, keyof WithDependencies<D>>> => {

      return class extends React.Component<Omit<P, keyof WithDependencies<D>>> {

        readonly deps: D

        constructor(props: Omit<P, keyof WithDependencies<D>>) {
          super(props)

          const deps: D = {} as D

          for (const key in dependencies) {

            if (dependencies.hasOwnProperty(key)) {
              const identifier = dependencies[key]

              deps[key] = container.resolve(identifier, WrappedComponent.name)
            }
          }

          this.deps = deps
        }

        render() {

          const passedProps: any = this.props

          const props = {
            deps: this.deps,
            ...passedProps
          }

          return (<WrappedComponent {...props} />)
        }
      }
    }
  }
