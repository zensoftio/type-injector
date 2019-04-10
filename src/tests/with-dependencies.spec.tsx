import {Container, Injectable, RegistrationEntry, RegistrationType} from '../dependency-container'

import * as React from 'react'
import {ComponentDependencies, withDependencies, WithDependencies} from '../with-dependencies'

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

  describe('withDependencies HOC', () => {

    it('Throws error if can not resolve dependencies', () => {
      const testContainer = new Container(testContainerName)

      interface Dependencies extends ComponentDependencies {
        dependency1: DependencyMock1
      }

      interface Props extends WithDependencies<Dependencies> {
        value: string
      }

      class Component extends React.Component<Props> {
      }

      const ComponentWithDependencies = withDependencies<Dependencies>({dependency1: testInjectionQualifier1}, testContainer)(Component)

      expect(() => {
        new ComponentWithDependencies({value: 'test'})
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
        render() {
          return <div>{this.props.value}</div>
        }
      }

      const ComponentWithDependencies = withDependencies<Dependencies>({dependency1: testInjectionQualifier1}, testContainer)(Component)

      const wrapper = Enzyme.shallow(<ComponentWithDependencies value={'test'}/>)

      expect(wrapper.at(0).props().deps.dependency1).toBeInstanceOf(DependencyMock1)
    })

    it('Accepts properties for wrapped component and passes them', () => {

      const testContainer = new Container(testContainerName)

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

      const ComponentWithDependencies = withDependencies<Dependencies>({}, testContainer)(Component)

      const wrapper = Enzyme.shallow(<ComponentWithDependencies value={testValue}/>)

      expect(wrapper.props().value).toEqual(testValue)
      expect(wrapper.at(0).props().value).toEqual(testValue)
    })
  })
})
