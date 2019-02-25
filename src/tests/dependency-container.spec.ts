import {
  Container,
  RegistrationEntry,
  RegistrationType,
  Injectable
} from '../dependency-container'

describe('Dependency Injection', () => {

  const testInjectionQualifier1 = 'testInjectionQualifier1'
  const testTargetName = 'Target'
  const testContainerName = 'TestContainer'

  class DependencyMock1 implements Injectable {

    awakeAfterInjection(): void {
    }

    postConstructor(): void {
    }
  }

  describe('Container', () => {

    it('throws error if registration type is invalid', () => {
      const container = new Container(testContainerName)

      const testQualifier = 'TestInjection'

      const registrationEntry = new RegistrationEntry(
        'Invalid' as any,
        () => new DependencyMock1()
      )

      expect(() => {
        container.register(testQualifier, registrationEntry)
      }).toThrow()
    })

    it('throws error if no registration provided', () => {

      const container = new Container(testContainerName)

      const testQualifier = 'TestInjection'

      expect(() => {
        container.resolve(testQualifier, testTargetName)
      }).toThrow(`No registration in container '${testContainerName}' for qualifier '${testQualifier}' requested by '${testTargetName}'`)
    })

    it('registers injectable entities', () => {

      const container = new Container(testContainerName)

      const registrationEntry =
        new RegistrationEntry(
          RegistrationType.TRANSIENT,
          () => new DependencyMock1()
        )

      container.register(testInjectionQualifier1, registrationEntry)

      expect(container.resolve(testInjectionQualifier1, testTargetName)).toBeInstanceOf(DependencyMock1)
    })

    it('clears injectable entities', () => {

      const container = new Container(testContainerName)

      const registrationEntry =
        new RegistrationEntry(
          RegistrationType.TRANSIENT,
          () => new DependencyMock1()
        )

      container.register(testInjectionQualifier1, registrationEntry)

      container.clear()

      expect(() => {
        container.resolve(testInjectionQualifier1, testTargetName)
      }).toThrow()
    })

    it('stores container-wide instances', () => {

      const container = new Container(testContainerName)

      const registrationEntry =
        new RegistrationEntry(
          RegistrationType.CONTAINER,
          () => new DependencyMock1()
        )

      container.register(testInjectionQualifier1, registrationEntry)

      const instance = container.resolve(testInjectionQualifier1, testTargetName)
      const otherInstance = container.resolve(testInjectionQualifier1, testTargetName)

      expect(otherInstance).toBe(instance)
    })

    it('constructs new transient instances', () => {

      const container = new Container(testContainerName)
      const registrationEntry = new RegistrationEntry(RegistrationType.TRANSIENT,
        () => new DependencyMock1())

      container.register(testInjectionQualifier1, registrationEntry)

      const instance = container.resolve(testInjectionQualifier1, testTargetName)
      const otherInstance = container.resolve(testInjectionQualifier1, testTargetName)

      expect(otherInstance).not.toBe(instance)
    })

    it('provides default container', () => {

      expect(Container.defaultContainer).toBeDefined()
    })

    it('provides component-specific containers', () => {

      const componentName = 'TestComponentName'

      expect(Container.containerForComponent(componentName)).toBeDefined()
    })
  })
})
