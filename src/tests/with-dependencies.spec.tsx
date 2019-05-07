import {Container, Injectable, RegistrationEntry, RegistrationType} from '../lib/container'
import {ComponentDependencies, DependencyProvider, WithDependencies} from '../lib/with-dependencies'

import * as React from 'react'
import * as Enzyme from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({adapter: new Adapter()})

describe('With Dependencies', () => {
  const testInjectionQualifier1 = 'testInjectionQualifier1'
  const testContainerName = 'TestContainer'

  class DependencyMock1 implements Injectable {

    awakeAfterInjection(): void {
    }

    postConstructor(): void {
    }
  }

  describe('Dependency Provider Component', () => {

    it('Throws error if cannot resolve dependencies', () => {
      const testContainer = new Container(testContainerName)

      interface Dependencies extends ComponentDependencies {
        dependency1: DependencyMock1
      }

      interface Props extends WithDependencies<Dependencies> {
        value: string
      }

      class Component extends React.Component<Props> {
      }

      expect(() => {
        new DependencyProvider<Dependencies, Props>({
          resolver: testContainer,
          dependencies: {dependency1: testInjectionQualifier1},
          passedProps: {value: 'test'},
          wrappedComponent: Component
        })
      })
        .toThrow(`No registration in container '${testContainerName}' for qualifier '${testInjectionQualifier1}'` +
          ` requested by '${Component.name}'`)
    })

    it('Provides dependencies to wrapped component', () => {

      const testContainer = new Container(testContainerName)

      testContainer.register(testInjectionQualifier1, new RegistrationEntry(RegistrationType.CONTAINER, () => new DependencyMock1()))

      interface Dependencies extends ComponentDependencies {
        dependency1: DependencyMock1
      }

      interface Props extends WithDependencies<Dependencies> {
        value: string
      }

      class Component extends React.Component<Props> {
      }

      const dependencyList = {dependency1: testInjectionQualifier1}

      const passedProps = {value: 'test'}

      new DependencyProvider<Dependencies, Props>({
        resolver: testContainer,
        dependencies: {dependency1: testInjectionQualifier1},
        passedProps: {value: 'test'},
        wrappedComponent: Component
      })

      const wrapper =
        Enzyme.shallow(
          <DependencyProvider
            resolver={testContainer}
            dependencies={dependencyList}
            passedProps={passedProps}
            wrappedComponent={Component}
          />
        )

      expect(wrapper.at(0).props().deps.dependency1).toBeInstanceOf(DependencyMock1)
    })

    it('Accepts properties for wrapped component and passes them', () => {

      const testContainer = new Container(testContainerName)

      testContainer.register(testInjectionQualifier1, new RegistrationEntry(RegistrationType.CONTAINER, () => new DependencyMock1()))

      const testValue = 'Test Value'

      interface Dependencies extends ComponentDependencies {
      }

      interface Props extends WithDependencies<Dependencies> {
        value: string
      }

      class Component extends React.Component<Props> {
        render() {
          return <div>{this.props.value}</div>
        }
      }

      const dependencyList = {dependency1: testInjectionQualifier1}
      const passedProps = {value: testValue}

      const wrapper = Enzyme.shallow(
        <DependencyProvider
          resolver={testContainer}
          dependencies={dependencyList}
          passedProps={passedProps}
          wrappedComponent={Component}
        />
      )

      expect(wrapper.at(0).props().value).toEqual(testValue)
    })
  })
})
