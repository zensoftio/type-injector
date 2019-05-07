import Assembler, {Assembly} from '../lib/assembler'
import {Container, Injectable, RegistrationEntry, RegistrationType} from '../lib/container'

describe('Assembler', () => {

  const testContainerName = 'Test Container'

  class TestDependency implements Injectable {
    awakeAfterInjection() {
    }

    postConstructor() {
    }
  }

  it('provides access to container as resolver', () => {
    const testContainer = new Container(testContainerName)
    const assembler = new Assembler([], testContainer)

    expect(assembler.resolver).toBe(testContainer)
  })

  it('loads assemblies', () => {
    const testContainer = new Container(testContainerName)
    const assembleSpy = jest.fn()
    const testAssembly: Assembly = {
      assemble: assembleSpy
    }

    const assembler = new Assembler([testAssembly], testContainer)
    assembler.assemble()

    expect(assembleSpy.mock.calls.length).toEqual(1)
    expect(assembleSpy.mock.calls[0][0]).toBe(testContainer)
  })

  it('finishes registration in container after assembling', () => {
    const testContainer = new Container(testContainerName)
    const assembler = new Assembler([], testContainer)
    assembler.assemble()

    expect(() => {
      testContainer.register('test', new RegistrationEntry(RegistrationType.TRANSIENT, () => new TestDependency()))
    }).toThrow(`Trying to register new dependency in '${testContainerName}'. It is illegal after calling 'finishRegistration()'`)
  })
})
