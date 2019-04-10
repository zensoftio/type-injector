/**
 * Registration Types for container,
 * TRANSIENT dependencies are created anew on each resolution
 * CONTAINER dependencies are stored within the container after first resolution becoming a container-wide singleton
 */
export enum RegistrationType {
  TRANSIENT,
  CONTAINER
}

/**
 * Protocol for injectable entities
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
 * Public part of the container
 */
export interface Resolver {

  /**
   * Method to resolve dependencies by
   * @param {string} qualifier - registration qualifier of the dependency
   * @param {string} targetName - name of the target requesting dependency, for error logging
   * @returns {T} - resolved dependency
   * @throws - Throws an error if registration for supplied qualifier is not present.
   */
  resolve<T extends Injectable>(qualifier: string, targetName: string): T
}

/**
 * Registration Entry for Container
 */
export class RegistrationEntry<T extends Injectable> {

  /**
   * @param {RegistrationType} type Registration type for the dependency
   * @param {(resolver: Resolver) => T} factory Factory function to create the dependency
   */
  constructor(readonly type: RegistrationType, readonly factory: (resolver: Resolver) => T) {
  }
}

/**
 * Public part of container to be used in assemblies
 */
export interface DependencyContainer extends Resolver {

  /**
   * Method to register dependencies
   * @param {string} qualifier - qualifier to register dependency by
   * @param {RegistrationEntry<T extends Injectable>} registration - registration entry for dependency
   */
  register<T extends Injectable>(qualifier: string, registration: RegistrationEntry<T>): void
}

/**
 * Dependency Container class
 */
export class Container implements DependencyContainer {

  private static internalContainer = new Container('DefaultContainer')

  /**
   * Common container to use across the project
   * @returns {Container} shared container instance
   */
  public static get defaultContainer(): Container {
    return this.internalContainer
  }

  private static componentContainers: Map<string, Container> = new Map()

  /**
   * Returns a container for specified component.
   * In testing environment, containers will be unique by component name to isolate tests.
   * In non-test environment, uses default container
   * @param {string} componentName
   * @returns {Container}
   */
  static containerForComponent(componentName: string): Container {

    // Under non-test environment (e.g. development, production) default container is used for all components.
    if (process.env.NODE_ENV !== 'test') {
      return this.defaultContainer
    }

    const container = this.componentContainers.get(componentName) || new Container(`${componentName}::Container`)
    this.componentContainers.set(componentName, container)

    return container
  }

  /**
   * A way to create container.
   * @param {string} name Container name for error logging
   */
  constructor(readonly name: string) {
  }

  private registrations: Map<string, RegistrationEntry<any>> = new Map()
  private instances: Map<string, Injectable> = new Map()

  private getInstance<T extends Injectable>(qualifier: string): T {

    return this.instances.get(qualifier) as T
  }

  /**
   * Method to resolve dependencies by. Note that dependencies are resolved lazily by default
   * @param {string} qualifier - registration qualifier of the dependency
   * @param {string} targetName - name of the target requesting dependency, for error logging
   * @returns {T} - resolved dependency
   * @throws - Throws an error if registration for supplied qualifier is not present.
   */
  public resolve<T extends Injectable>(qualifier: string, targetName: string): T {

    const registration = this.registrations.get(qualifier)

    if (!registration) {
      throw new Error(`No registration in container '${this.name}' for qualifier '${qualifier}' requested by '${targetName}'`)
    }

    return this.getInstance(qualifier) || this.construct(registration, qualifier)
  }

  /**
   * Method to register dependencies by
   * @param {string} qualifier Identifier of the dependency
   * @param {RegistrationEntry<T extends Injectable>} registration Registration entry describing the dependency
   */
  public register<T extends Injectable>(qualifier: string, registration: RegistrationEntry<T>) {
    if (registration.type !== RegistrationType.TRANSIENT && registration.type !== RegistrationType.CONTAINER) {
      throw new Error(`Invalid registration type ${registration.type}' for qualifier '${qualifier}'`)
    }

    this.registrations.set(qualifier, registration)
  }

  /**
   * Method to clear whole container, removes all registrations and created instances
   */
  public clear() {
    this.registrations = new Map()
    this.instances = new Map()
  }

  private construct<T extends Injectable>(registration: RegistrationEntry<T>, qualifier: string) {
    const instance = registration.factory(this)

    if (registration.type === RegistrationType.CONTAINER) {
      this.instances.set(qualifier, instance as Injectable)
    }

    return instance
  }
}
