import {Container, Injectable, RegistrationEntry, RegistrationType, Resolver} from './dependency-container'
import 'reflect-metadata'
import * as React from 'react'

export const PROPERTY_INJECTIONS = Symbol('property_injections')
export const METHOD_INJECTIONS = Symbol('method_injections')
export const CONSTRUCTOR_INJECTIONS = Symbol('constructor_injections')

function performInjection(resolver: Resolver, target: Injectable | InjectAware) {
  const propertyInjections: PropertyInjectionRecord[] = Reflect.getMetadata(PROPERTY_INJECTIONS, target) || []
  propertyInjections.forEach(injection => {
    (target as any)[injection.propertyKey] = resolver.resolve(injection.qualifier, target.constructor.name)
  })

  const methodInjections: MethodInjectionRecord[] = Reflect.getMetadata(METHOD_INJECTIONS, target) || []
  methodInjections.forEach(injection => {
    (target as any)[injection.setterName](resolver.resolve(injection.qualifier, target.constructor.name))
  })
}

class PropertyInjectionRecord {
  constructor(public qualifier: string, public propertyKey: string) {
  }
}

class MethodInjectionRecord {
  constructor(public qualifier: string, public setterName: string) {
  }
}

class ConstructorInjectionRecord {
  constructor(public qualifier: string, public index: number) {
  }
}

/**
 * Marks property as dependency. The dependency will be injected when target is resolved from container.
 * @note This decorator works for both, resolvable dependencies and inject-aware components.
 * @param {string} qualifier - name of dependency to be injected.
 * @returns {(target: any, propertyKey: string) => void}
 */
export const injectProperty = (qualifier: string) => (target: any, propertyKey: string) => {
  if (!Reflect.hasOwnMetadata(PROPERTY_INJECTIONS, target)) {
    // Handling parent dependencies, if any
    const parentDependencies = Reflect.getMetadata(PROPERTY_INJECTIONS, target) || []
    Reflect.defineMetadata(PROPERTY_INJECTIONS, [...parentDependencies], target)
  }
  const metadata = Reflect.getOwnMetadata(PROPERTY_INJECTIONS, target)
  metadata.push(new PropertyInjectionRecord(qualifier, propertyKey))
}

/**
 * Marks method as injector-method. The dependency will be injected when target is resolved from container.
 * @note This decorator works for both, resolvable dependencies and inject-aware components.
 * @param {string} qualifier - name of dependency to be injected.
 * @returns {(target: any, setterName: string) => void}
 */
export const injectMethod = (qualifier: string) => (target: any, setterName: string) => {
  if (!Reflect.hasOwnMetadata(METHOD_INJECTIONS, target)) {
    // Handling parent dependencies, if any
    const parentDependencies = Reflect.getMetadata(METHOD_INJECTIONS, target) || []
    Reflect.defineMetadata(METHOD_INJECTIONS, [...parentDependencies], target)
  }
  const metadata = Reflect.getOwnMetadata(METHOD_INJECTIONS, target)
  metadata.push(new MethodInjectionRecord(qualifier, setterName))
}

/**
 * Marks constructor argument as dependency. The dependency will be injected when target is resolved from container.
 * @note This decorator SHOULD NOT be used for components!
 * @param {string} qualifier - name of dependency to be injected.
 * @returns {(target: any, _: any, index: number) => void}
 */
export const injectConstructor = (qualifier: string) => (target: any, _: any, index: number) => {

  if (target.prototype.isReactComponent) {
    throw new Error(`'@injectConstructor' decorator SHOULD NOT be used for React components! Usage on '${target.name}' is invalid.`)
  }

  if (!Reflect.hasOwnMetadata(CONSTRUCTOR_INJECTIONS, target)) {
    Reflect.defineMetadata(CONSTRUCTOR_INJECTIONS, [], target)
  }
  const metadata = Reflect.getOwnMetadata(CONSTRUCTOR_INJECTIONS, target)
  metadata.push(new ConstructorInjectionRecord(qualifier, index))
}

/**
 * Registers target class as a dependency in the provided container.
 * After that, instance(s) of the class will be available for resolution.
 * @note For isolation purposes this decorator is DOES NOT register any dependencies into default container in testing mode.
 * @note This decorator SHOULD NOT be used for components.
 * @param {string} qualifier, name of dependency to register by
 * @param {RegistrationType} registrationType, registration type
 * @param {Container} container, container to register in
 * @returns {(target: any) => (any)}
 */
export const injectable = (qualifier: string,
                           registrationType: RegistrationType = RegistrationType.CONTAINER,
                           container: Container = Container.defaultContainer) => (target: any) => {

  if (target.prototype.isReactComponent) {
    throw new Error(`'@injectable' decorator SHOULD NOT be used for React components! Usage on '${target.name}' is invalid.`)
  }

  // NOTE: For isolation purposes this decorator is disabled in testing mode for default container
  if (process.env.NODE_ENV === 'test' && container === Container.defaultContainer) {
    return target
  }

  const registration = new RegistrationEntry(registrationType, (resolver: Resolver) => {

    const constructorInjectors: ConstructorInjectionRecord[] = Reflect.getOwnMetadata(CONSTRUCTOR_INJECTIONS, target)

    let instance: Injectable

    if (constructorInjectors && constructorInjectors.length > 0) {
      instance = new target(...(constructorInjectors
        .sort((a, b) => (a.index - b.index))
        .map(it => it !== undefined ? resolver.resolve(it.qualifier, target.name) : undefined))
      )
    } else {
      instance = new target()
    }

    instance.postConstructor()

    performInjection(resolver, instance)

    instance.awakeAfterInjection()

    return instance
  })

  container.register(qualifier, registration)

  return target
}

export const INJECT_AWARE = Symbol('inject_aware')

export interface InjectAware extends React.Component {
  awakeAfterInjection?(): void
}

/**
 * Provides support for @injectProperty and @injectMethod decorators in React components.
 * @note After using this decorator an awakeAfterInjection() lifecycle hook is available for your component
 * @note This decorator SHOULD ONLY be used for React Components.
 * @note This decorator DOES NOT support @injectConstructor entries!
 * @param {Container} container, container to use for resolution
 * @returns {(target: any) => (any | object)}
 */
export const injectAware = (container?: Container) => (target: any) => {

  if (!target.prototype.isReactComponent) {
    throw new Error(`'@injectAware' decorator SHOULD ONLY be used for React components! Usage on '${target.name}' is invalid`)
  }

  console.warn('injectAware decorator is deprecated and will be removed in upcoming version. ' +
    'Please, migrate your code to withDependencies HOC')

  // Same component class should not be decorated as inject-aware twice
  if (Reflect.getOwnMetadata(INJECT_AWARE, target)) {
    return target
  }

  // NOTE: This decorator WILL work during testing to allow component configuration under Jest and React Test Renderer
  const proxy = new Proxy(target, {
    construct(clz, args) {

      const componentContainer = container || Container.containerForComponent(target.name)

      const instance: InjectAware = Reflect.construct(clz, args)

      performInjection(componentContainer, instance)

      instance.awakeAfterInjection && instance.awakeAfterInjection()

      return instance
    }
  })

  Reflect.defineMetadata(INJECT_AWARE, true, proxy)

  return proxy
}
