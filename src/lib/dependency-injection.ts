import 'reflect-metadata'
import {Injectable, RegistrationEntry, RegistrationType, Resolver} from './container'

export const PROPERTY_INJECTIONS = Symbol('property_injections')
export const METHOD_INJECTIONS = Symbol('method_injections')
export const CONSTRUCTOR_INJECTIONS = Symbol('constructor_injections')
export const INJECTABLE_REGISTRATION = Symbol('injectable_registration')

function performInjection(resolver: Resolver, target: Injectable) {
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
 * @note This decorator SHOULD NOT be used for components!
 * @param {string} qualifier - name of dependency to be injected.
 * @returns {(target: any, propertyKey: string) => void}
 */
export const injectProperty = (qualifier: string) => (target: any, propertyKey: string) => {

  if (target.constructor.prototype.isReactComponent) {
    throw new Error(`'@injectProperty' decorator SHOULD NOT be used for React components! Usage on '${target.name}' is invalid.`)
  }

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
 * @note This decorator SHOULD NOT be used for components!
 * @param {string} qualifier - name of dependency to be injected.
 * @returns {(target: any, setterName: string) => void}
 */
export const injectMethod = (qualifier: string) => (target: any, setterName: string) => {

  if (target.constructor.prototype.isReactComponent) {
    throw new Error(`'@injectMethod' decorator SHOULD NOT be used for React components! Usage on '${target.name}' is invalid.`)
  }

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
 * Attaches registration information to target class.
 * @note This decorator SHOULD NOT be used for components.
 * @note multiple @injectable declarations may be used for single class.
 * @param {string} qualifier, name of dependency to register by
 * @param {RegistrationType} registrationType, registration type
 * @returns {(target: any) => (any)}
 */
export const injectable = (qualifier: string,
                           registrationType: RegistrationType = RegistrationType.CONTAINER) => (target: any) => {

  if (target.prototype.isReactComponent) {
    throw new Error(`'@injectable' decorator SHOULD NOT be used for React components! Usage on '${target.name}' is invalid.`)
  }

  const registration = new RegistrationEntry(registrationType, (resolver: Resolver) => {

    const constructorInjectors: ConstructorInjectionRecord[] = Reflect.getOwnMetadata(CONSTRUCTOR_INJECTIONS, target)

    let instance: Injectable

    if (constructorInjectors && constructorInjectors.length > 0) {
      instance = new target(...(constructorInjectors
        .sort((a, b) => (a.index - b.index))
        .map(it => it !== undefined ? resolver.resolve(it.qualifier, target.constructor.name) : undefined))
      )
    } else {
      instance = new target()
    }

    instance.postConstructor()

    performInjection(resolver, instance)

    instance.awakeAfterInjection()

    return instance
  })

  if (!Reflect.hasOwnMetadata(INJECTABLE_REGISTRATION, target)) {
    Reflect.defineMetadata(INJECTABLE_REGISTRATION, {}, target)
  }

  const registrations: {[key: string]: RegistrationEntry<typeof target>} = Reflect.getOwnMetadata(INJECTABLE_REGISTRATION, target)
  registrations[qualifier] = registration

  return target
}
