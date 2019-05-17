import {Container, Injectable, RegistrationEntry, RegistrationType} from '../lib/container'
import {ManualRegistrationAssembly, ClassLoaderAssembly} from '../lib/assembly'
import {injectable} from '../lib/dependency-injection'

describe('Assembly', () => {

  const testContainerName = 'Test Container'

  const testDependencyQualifier = 'TestDependency'

  class TestDependency implements Injectable {
    awakeAfterInjection() {
    }

    postConstructor() {
    }
  }

  const testSuiteName = 'Test Case Suite'

  describe('Manual Registration Assembly', () => {
    it('loads dependencies to the container', () => {

      const testContainer = new Container(testContainerName)

      const registration = new RegistrationEntry(RegistrationType.TRANSIENT, () => new TestDependency())

      const manualAssembly = new ManualRegistrationAssembly([{qualifier: testDependencyQualifier, entry: registration}])

      manualAssembly.assemble(testContainer)

      const dependency = testContainer.resolve(testDependencyQualifier, testSuiteName)

      expect(dependency).toBeInstanceOf(TestDependency)
    })
  })

  describe('Class Loader Assembly', () => {
    it('loads dependencies to the container', () => {

      const testContainer = new Container(testContainerName)

      const decoratedDependency = injectable(testDependencyQualifier)(TestDependency)

      const classLoaderAssembly = new ClassLoaderAssembly([decoratedDependency])

      classLoaderAssembly.assemble(testContainer)

      const dependency = testContainer.resolve(testDependencyQualifier, testSuiteName)

      expect(dependency).toBeInstanceOf(TestDependency)
    })
  })
})
