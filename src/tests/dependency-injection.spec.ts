import {
  CONSTRUCTOR_INJECTIONS, METHOD_INJECTIONS, PROPERTY_INJECTIONS,
  injectable, injectConstructor, injectMethod, injectProperty, INJECTABLE_REGISTRATION
} from '../lib/dependency-injection'

import {Injectable, RegistrationEntry, RegistrationType} from '../lib/container'

describe('Dependency Injection', () => {

  const testInjectionQualifier1 = 'testInjectionQualifier1'
  const testInjectionQualifier2 = 'testInjectionQualifier2'

  class DependencyMock1 implements Injectable {

    awakeAfterInjection(): void {
    }

    postConstructor(): void {
    }
  }

  describe('injectable decorator', () => {

    it('attaches registration information to target class', () => {

      injectable(testInjectionQualifier1, RegistrationType.TRANSIENT)(DependencyMock1)

      const registrations = Reflect.getOwnMetadata(INJECTABLE_REGISTRATION, DependencyMock1)

      expect(registrations[testInjectionQualifier1]).toBeInstanceOf(RegistrationEntry)
      expect(registrations[testInjectionQualifier1].type).toEqual(RegistrationType.TRANSIENT)
    })

    it('registers container-wide dependencies by default', () => {

      injectable(testInjectionQualifier1, undefined)(DependencyMock1)

      const registrations = Reflect.getOwnMetadata(INJECTABLE_REGISTRATION, DependencyMock1)

      expect(registrations[testInjectionQualifier1]).toBeInstanceOf(RegistrationEntry)
      expect(registrations[testInjectionQualifier1].type).toEqual(RegistrationType.CONTAINER)
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

        @injectMethod(testInjectionQualifier1) setMock() {
        }

        @injectMethod(testInjectionQualifier2) setTest() {
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
  })
})
