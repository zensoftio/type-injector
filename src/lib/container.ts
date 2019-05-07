import 'reflect-metadata'

export enum RegistrationType {
  TRANSIENT, // new instance is created on every resolution
  CONTAINER,  // instance created on first resolution is retained by the container becoming a container-wide singleton
  CONTAINER_EAGER // same as CONTAINER, but instance is created eagerly after registration is complete
}

/**
 * Core protocol for injectable entities to use with decorators
 */
export interface Injectable extends Object {
  /**
   * Called by container after constructor, but before property/method injections
   */
  postConstructor(): void

  /**
   * Called by container after all property/method injections
   */
  awakeAfterInjection(): void
}

/**
 * In most cases your Container goes by this name
 */
export interface Resolver {

  /**
   * A straightforward way to resolve your dependencies
   * @param {string | symbol} qualifier, registration qualifier of your dependency
   * @param {string} targetName name of dependent component that requests a dependency
   * @returns {T}
   */
  resolve<T extends Injectable>(qualifier: string | symbol, targetName: string): T
}

/**
 * This small class encapsulates the configuration of a dependency
 */
export class RegistrationEntry<T extends Injectable> {

  /**
   * Constructor
   * @param {RegistrationType} type, configures the behavior of dependency
   * @param {(resolver: Resolver) => T} factory, constructs the dependency instance(s)
   */
  constructor(readonly type: RegistrationType, readonly factory: (resolver: Resolver) => T) {
  }
}

/**
 * Dependency Container
 * The core class of DI package.
 * Resolves registered dependencies by configuration
 */
export class Container implements Resolver {

  private static internalContainer = new Container('DefaultContainer')

  /**
   * Default singleton container
   * @returns {Container}
   */
  static get defaultContainer(): Container {
    return this.internalContainer
  }

  constructor(readonly name: string) {
  }

  private registrations: Map<string | symbol, RegistrationEntry<any>> = new Map()
  private instances: Map<string | symbol, Injectable> = new Map()
  private eagerDependencies: Array<string | symbol> = []
  private registrationFinished: boolean = false

  private getInstance<T extends Injectable>(qualifier: string | symbol): T {

    return this.instances.get(qualifier) as T
  }

  /**
   * A straightforward way to resolve your dependencies
   * @param {string | symbol} qualifier, registration qualifier of your dependency
   * @param {string} targetName name of dependent component that requests a dependency
   * @returns {T}
   */
  public resolve<T extends Injectable>(qualifier: string | symbol, targetName: string): T {

    const registration = this.registrations.get(qualifier)

    if (!registration) {
      throw new Error(`No registration in container '${this.name}' for qualifier '${String(qualifier)}' requested by '${targetName}'`)
    }

    return this.getInstance(qualifier) || this.construct(registration, qualifier)
  }

  /**
   * Explicit way to register dependencies.
   * @param {string | symbol} qualifier, registration qualifier of your dependency.
   * You will use this qualifier in future to resolve the dependency.
   * @param {RegistrationEntry<T extends Injectable>} registration, configuration of your dependency.
   */
  public register<T extends Injectable>(qualifier: string | symbol, registration: RegistrationEntry<T>) {

    if (this.registrationFinished) {
      throw new Error(`Trying to register new dependency in '${this.name}'. It is illegal after calling 'finishRegistration()'`)
    }

    if (registration.type !== RegistrationType.TRANSIENT &&
      registration.type !== RegistrationType.CONTAINER &&
      registration.type !== RegistrationType.CONTAINER_EAGER) {
      throw new Error(`Invalid registration type ${registration.type}' for qualifier '${String(qualifier)}'`)
    }

    if (this.registrations.has(qualifier)) {
      console.warn(`Duplicate registration for qualifier '${String(qualifier)}' in container '${this.name}'.` +
        'Container will use the last one.')
    }

    this.registrations.set(qualifier, registration)

    if (registration.type === RegistrationType.CONTAINER_EAGER) {
      if (this.eagerDependencies.indexOf(qualifier) === -1) {
        this.eagerDependencies.push(qualifier)
      }
    }
  }

  /**
   * A way to destroy everything. Completely resets the container.
   * All registration entries and existing instances will be removed.
   */
  public clear() {
    this.registrations = new Map()
    this.instances = new Map()
    this.eagerDependencies = []
    this.registrationFinished = false
  }

  private construct<T extends Injectable>(registration: RegistrationEntry<T>, qualifier: string | symbol) {
    const instance = registration.factory(this)

    if (registration.type === RegistrationType.CONTAINER || registration.type === RegistrationType.CONTAINER_EAGER) {
      this.instances.set(qualifier, instance as Injectable)
    }

    return instance
  }

  /**
   * Convince way to finish registration of your dependencies.
   * @note it is required to call this method to construct Eager dependencies.
   * @returns {Promise<void>}
   */
  public finishRegistration(): Promise<void> {

    return new Promise((resolve, reject) => {

      this.eagerDependencies.forEach(qualifier => {
        try {
          this.resolve(qualifier, this.name)
        } catch (e) {
          reject(e)
        }
      })

      this.registrationFinished = true
      resolve()
    })
  }
}
