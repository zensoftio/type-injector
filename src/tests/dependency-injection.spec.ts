import {
  CONSTRUCTOR_INJECTIONS, METHOD_INJECTIONS, PROPERTY_INJECTIONS, INJECT_AWARE,
  injectable,
  injectAware, injectConstructor, injectMethod, injectProperty
} from '../dependency-injection'
import {Container, Injectable, RegistrationType} from '../dependency-container'
import * as React from 'react'

describe('Dependency Injection', () => {

  const testInjectionQualifier1 = 'testInjectionQualifier1'
  const testInjectionQualifier2 = 'testInjectionQualifier2'
  const testTargetName = 'Target'
  const testContainerName = 'TestContainer'

  class DependencyMock1 implements Injectable {

    awakeAfterInjection(): void {
    }

    postConstructor(): void {
    }
  }

  class DependencyMock2 implements Injectable {

    awakeAfterInjection(): void {
    }

    postConstructor(): void {
    }
  }

  describe('injectable decorator', () => {

    it('registers injectable items in provided container', () => {

      const container = new Container(testContainerName)

      injectable(testInjectionQualifier1, RegistrationType.TRANSIENT, container)(DependencyMock1)

      expect(container.resolve(testInjectionQualifier1, testTargetName)).toBeInstanceOf(DependencyMock1)
    })

    it('throws error if used on React component', () => {

      class Component extends React.Component {
      }

      expect(() => {

        injectable('InjectableComponent')(Component)

      }).toThrow(`'@injectable' decorator SHOULD NOT be used for React components! Usage on '${Component.name}' is invalid.`)
    })


    it('does not affect default container in test environment', () => {

      injectable(testInjectionQualifier1, RegistrationType.TRANSIENT)(DependencyMock1)

      expect(() => Container.defaultContainer.resolve(testInjectionQualifier1, testTargetName))
        .toThrow(`No registration in container '${Container.defaultContainer.name}' for qualifier '${testInjectionQualifier1}' requested by '${testTargetName}'`)
    })

    it('does not affect other containers', () => {

      const container = new Container(testContainerName)

      injectable(testInjectionQualifier1, RegistrationType.TRANSIENT, container)(DependencyMock1)

      expect(() => Container.defaultContainer.resolve(testInjectionQualifier1, testTargetName))
        .toThrow(`No registration in container '${Container.defaultContainer.name}' for qualifier '${testInjectionQualifier1}' requested by '${testTargetName}'`)
    })

    it('registers container-wide dependencies by default', () => {

      const container = new Container(testContainerName)

      injectable(testInjectionQualifier1, undefined, container)(DependencyMock1)

      const instance = container.resolve(testInjectionQualifier1, testTargetName)
      const otherInstance = container.resolve(testInjectionQualifier1, testTargetName)

      expect(otherInstance).toBe(instance)
    })

    it('works with container to handle constructor injections', () => {

      const container = new Container(testContainerName)

      injectable(testInjectionQualifier1, RegistrationType.TRANSIENT, container)(DependencyMock1)
      injectable(testInjectionQualifier2, RegistrationType.TRANSIENT, container)(DependencyMock2)

      class DependentEntity implements Injectable {

        constructor(@injectConstructor(testInjectionQualifier1) public testInjection1: DependencyMock1,
                    @injectConstructor(testInjectionQualifier2) public testInjection2: DependencyMock2) {
        }

        awakeAfterInjection(): void {
        }

        postConstructor(): void {
        }
      }

      const testQualifier = 'TestInjection'

      injectable(testQualifier, RegistrationType.TRANSIENT, container)(DependentEntity)

      const instance: DependentEntity = container.resolve(testQualifier, testTargetName)

      expect(instance.testInjection1).toBeInstanceOf(DependencyMock1)
      expect(instance.testInjection2).toBeInstanceOf(DependencyMock2)
    })
  })

  describe('injectProperty decorator', () => {

    it('adds injection information to metadata', () => {

      class InjectMock {

        @injectProperty(testInjectionQualifier1) mock: any
        @injectProperty(testInjectionQualifier2) test: any
      }

      const testObject = new InjectMock()

      const metadata = Reflect.getMetadata(PROPERTY_INJECTIONS, testObject)

      expect(metadata.length).toBe(2)

      expect(metadata[0].qualifier).toBe(testInjectionQualifier1)
      expect(metadata[0].propertyKey).toBe('mock')

      expect(metadata[1].qualifier).toBe(testInjectionQualifier2)
      expect(metadata[1].propertyKey).toBe('test')
    })
  })

  describe('injectMethod decorator', () => {

    it('adds injection information to metadata', () => {

      class InjectMock {

        @injectMethod(testInjectionQualifier1) setMock(_: any) {
        }

        @injectMethod(testInjectionQualifier2) setTest(_: any) {
        }
      }

      const testObject = new InjectMock()

      const metadata = Reflect.getMetadata(METHOD_INJECTIONS, testObject)

      expect(metadata.length).toBe(2)

      expect(metadata[0].qualifier).toBe(testInjectionQualifier1)
      expect(metadata[0].setterName).toBe('setMock')

      expect(metadata[1].qualifier).toBe(testInjectionQualifier2)
      expect(metadata[1].setterName).toBe('setTest')
    })
  })

  describe('injectConstructor decorator', () => {

    it('adds injection information to metadata', () => {

      class InjectMock {

        mock: any

        constructor(@injectConstructor(testInjectionQualifier1) mock: any) {
          this.mock = mock
        }
      }

      const metadata = Reflect.getOwnMetadata(CONSTRUCTOR_INJECTIONS, InjectMock)

      expect(metadata.length).toBe(1)

      expect(metadata[0].qualifier).toBe(testInjectionQualifier1)
      expect(metadata[0].index).toBe(0)
    })

    it('throws error if used on React component', () => {

      expect(() => {

        //@ts-ignore noUnusedLocals
        class Component extends React.Component {

          //@ts-ignore noUnusedParameters
          constructor(props: any, state: any, @injectConstructor(testInjectionQualifier1) _: any) {
            super(props, state)
          }

        }

      }).toThrow(`'@injectConstructor' decorator SHOULD NOT be used for React components! Usage on 'Component' is invalid.`)
    })
  })

  describe('injectAware decorator', () => {

    it('marks decorated class as inject-aware', () => {

      const container = new Container(testContainerName)

      class ComponentClass extends React.Component {
        @injectProperty(testInjectionQualifier1) mock: DependencyMock1
      }

      const InjectAwareClass = injectAware(container)(ComponentClass)

      expect(Reflect.getOwnMetadata(INJECT_AWARE, InjectAwareClass)).toBeTruthy()
    })

    it('creates a valid proxy class from decorated component', () => {

      const container = new Container(testContainerName)

      injectable(testInjectionQualifier1, RegistrationType.TRANSIENT, container)(DependencyMock1)

      class ComponentClass extends React.Component {
        @injectProperty(testInjectionQualifier1) mock: DependencyMock1
      }

      const InjectAwareClass = injectAware(container)(ComponentClass)

      const component = new InjectAwareClass()

      expect(component).toBeInstanceOf(ComponentClass)
    })

    it('uses isolated container in test environment', () => {

      class ComponentClass extends React.Component {
        @injectProperty(testInjectionQualifier1) mock: DependencyMock1
      }

      const container = Container.containerForComponent(ComponentClass.name)

      injectable(testInjectionQualifier1, RegistrationType.TRANSIENT, container)(DependencyMock1)

      const InjectAwareClass = injectAware()(ComponentClass)
      const component = new InjectAwareClass()

      expect(component.mock).toBeInstanceOf(DependencyMock1)
    })

    it('handles injectProperty decorators', () => {

      const container = new Container(testContainerName)

      injectable(testInjectionQualifier1, RegistrationType.TRANSIENT, container)(DependencyMock1)

      class ComponentClass extends React.Component {
        @injectProperty(testInjectionQualifier1) mock: DependencyMock1
      }

      const InjectAwareClass = injectAware(container)(ComponentClass)

      const component = new InjectAwareClass()

      expect(component.mock).toBeInstanceOf(DependencyMock1)
    })

    it('handles injectMethod decorators', () => {

      const container = new Container(testContainerName)

      injectable(testInjectionQualifier1, RegistrationType.TRANSIENT, container)(DependencyMock1)

      class ComponentClass extends React.Component {
        dependency: DependencyMock1

        @injectMethod(testInjectionQualifier1) setDependency(d: DependencyMock1) {
          this.dependency = d
        }
      }

      const InjectAwareClass = injectAware(container)(ComponentClass)

      const component = new InjectAwareClass()

      expect(component.dependency).toBeInstanceOf(DependencyMock1)
    })

    it('calls awakeAfterInjection hook', () => {

      const container = new Container(testContainerName)

      const awakeAfterInjectionMock = jest.fn()

      class ComponentClass extends React.Component {
        awakeAfterInjection = awakeAfterInjectionMock
      }

      const InjectAwareClass = injectAware(container)(ComponentClass)

      new InjectAwareClass()

      expect(awakeAfterInjectionMock.mock.calls.length).toBe(1)
    })

    it('is an idempotent operation', () => {

      const container = new Container(testContainerName)

      injectable(testInjectionQualifier1, RegistrationType.TRANSIENT, container)(DependencyMock1)

      class ComponentClass extends React.Component {
        @injectProperty(testInjectionQualifier1) mock: DependencyMock1
      }

      const InjectAwareClass1 = injectAware(container)(ComponentClass)

      const InjectAwareClass2 = injectAware(container)(InjectAwareClass1)

      expect(Reflect.getOwnMetadata(INJECT_AWARE, InjectAwareClass1)).toBeTruthy()
      expect(InjectAwareClass2).toBe(InjectAwareClass1)
    })

    it('handles parent class dependencies', () => {

      const container = new Container(testContainerName)

      injectable(testInjectionQualifier1, RegistrationType.TRANSIENT, container)(DependencyMock1)
      injectable(testInjectionQualifier2, RegistrationType.TRANSIENT, container)(DependencyMock2)

      @injectAware(container)
      class InjectAwareParent extends React.Component {
        @injectProperty(testInjectionQualifier1) injection1: DependencyMock1
      }

      @injectAware(container)
      class InjectAwareChild extends InjectAwareParent {
        @injectProperty(testInjectionQualifier2) injection2: DependencyMock2
      }

      const instance = new InjectAwareChild({})

      expect(instance.injection1).toBeInstanceOf(DependencyMock1)
    })

    it('handles child class dependencies', () => {

      const container = new Container(testContainerName)

      injectable(testInjectionQualifier1, RegistrationType.TRANSIENT, container)(DependencyMock1)
      injectable(testInjectionQualifier2, RegistrationType.TRANSIENT, container)(DependencyMock2)

      @injectAware(container)
      class InjectAwareParent extends React.Component {
        @injectProperty(testInjectionQualifier1) injection1: DependencyMock1
      }

      @injectAware(container)
      class InjectAwareChild extends InjectAwareParent {
        @injectProperty(testInjectionQualifier2) injection2: DependencyMock2
      }

      const instance = new InjectAwareChild({})

      expect(instance.injection2).toBeInstanceOf(DependencyMock2)
    })

    it('does not inject child dependencies into parent class', () => {

      const container = new Container(testContainerName)

      injectable(testInjectionQualifier1, RegistrationType.TRANSIENT, container)(DependencyMock1)
      injectable(testInjectionQualifier2, RegistrationType.TRANSIENT, container)(DependencyMock2)

      @injectAware(container)
      class InjectAwareParent extends React.Component {
        @injectProperty(testInjectionQualifier1) injection1: DependencyMock1
      }

      @injectAware(container)
        //@ts-ignore noUnusedLocals
      class InjectAwareChild extends InjectAwareParent {
        @injectProperty(testInjectionQualifier2) injection2: DependencyMock2
      }

      const instance = new InjectAwareParent({})

      expect((instance as any).injection2).not.toBeInstanceOf(DependencyMock2)
    })

    it('throws error if used on a non React component class', () => {

      class TestClass {
      }

      expect(() => {

        injectAware()(TestClass)

      }).toThrow(`'@injectAware' decorator SHOULD ONLY be used for React components! Usage on '${TestClass.name}' is invalid`)
    })
  })
})
