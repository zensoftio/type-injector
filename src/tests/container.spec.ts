import {
  Container,
  RegistrationEntry,
  RegistrationType,
  Injectable
} from '../lib/container'

describe('Container', () => {

  const testContainerName = 'Test Container'
  const testSuiteName = 'Test Case Suite'

  const testInjectionQualifier1 = 'testInjectionQualifier1'

  class DependencyMock1 implements Injectable {

    awakeAfterInjection(): void {
    }

    postConstructor(): void {
    }
  }

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
      container.resolve(testQualifier, testSuiteName)
    }).toThrow(`No registration in container '${testContainerName}' for qualifier '${testQualifier}' requested by '${testSuiteName}'`)
  })

  it('registers injectable entities', () => {

    const container = new Container(testContainerName)

    const registrationEntry =
      new RegistrationEntry(
        RegistrationType.TRANSIENT,
        () => new DependencyMock1()
      )

    container.register(testInjectionQualifier1, registrationEntry)

    expect(container.resolve(testInjectionQualifier1, testSuiteName)).toBeInstanceOf(DependencyMock1)
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
      container.resolve(testInjectionQualifier1, testSuiteName)
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

    const instance = container.resolve(testInjectionQualifier1, testSuiteName)
    const otherInstance = container.resolve(testInjectionQualifier1, testSuiteName)

    expect(otherInstance).toBe(instance)
  })

  it('stores container-wide eager instances', () => {

    const container = new Container(testContainerName)

    const registrationEntry =
      new RegistrationEntry(
        RegistrationType.CONTAINER_EAGER,
        () => new DependencyMock1()
      )

    container.register(testInjectionQualifier1, registrationEntry)

    const instance = container.resolve(testInjectionQualifier1, testSuiteName)
    const otherInstance = container.resolve(testInjectionQualifier1, testSuiteName)

    expect(otherInstance).toBe(instance)
  })

  it('create instances eagerly, after registration is finished', async () => {

    const container = new Container(testContainerName)

    const spy = jest.fn()

    const registrationEntry =
      new RegistrationEntry(
        RegistrationType.CONTAINER_EAGER,
        () => {
          spy()
          return new DependencyMock1()
        }
      )

    container.register(testInjectionQualifier1, registrationEntry)

    await container.finishRegistration()

    expect(spy.mock.calls.length).toEqual(1)
  })

  it('throws error if user tries to register new dependency after registration is finished', async () => {
    const testContainer = new Container(testContainerName)

    await testContainer.finishRegistration()

    expect(() => {
      testContainer.register('test', new RegistrationEntry(RegistrationType.TRANSIENT, () => new DependencyMock1()))
    }).toThrow(`Trying to register new dependency in '${testContainerName}'. It is illegal after calling 'finishRegistration()'`)
  })

  it('constructs new transient instances', () => {

    const container = new Container(testContainerName)
    const registrationEntry = new RegistrationEntry(RegistrationType.TRANSIENT,
      () => new DependencyMock1())

    container.register(testInjectionQualifier1, registrationEntry)

    const instance = container.resolve(testInjectionQualifier1, testSuiteName)
    const otherInstance = container.resolve(testInjectionQualifier1, testSuiteName)

    expect(otherInstance).not.toBe(instance)
  })

  it('provides default container', () => {

    expect(Container.defaultContainer).toBeDefined()
  })
})
