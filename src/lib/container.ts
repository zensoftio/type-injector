import 'reflect-metadata'

export enum RegistrationType {
  TRANSIENT, // new instance is created on every resolution
  CONTAINER,  // instance created on first resolution is retained by the container becoming a container-wide singleton
  CONTAINER_EAGER // same as CONTAINER, but instance is created eagerly after registration is complete
}

/**
 * Core protocol for injectable entities
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

export interface Resolver {
  resolve<T extends Injectable>(qualifier: string, targetName: string): T
}

export class RegistrationEntry<T extends Injectable> {
  constructor(readonly type: RegistrationType, readonly factory: (resolver: Resolver) => T) {
  }
}

export class Container implements Resolver {

  private static internalContainer = new Container('DefaultContainer')

  static get defaultContainer(): Container {
    return this.internalContainer
  }

  constructor(readonly name: string) {
  }

  private registrations: Map<string, RegistrationEntry<any>> = new Map()
  private instances: Map<string, Injectable> = new Map()
  private eagerDependencies: string[] = []
  private registrationFinished: boolean = false

  private getInstance<T extends Injectable>(qualifier: string): T {

    return this.instances.get(qualifier) as T
  }

  public resolve<T extends Injectable>(qualifier: string, targetName: string): T {

    const registration = this.registrations.get(qualifier)

    if (!registration) {
      throw new Error(`No registration in container '${this.name}' for qualifier '${qualifier}' requested by '${targetName}'`)
    }

    return this.getInstance(qualifier) || this.construct(registration, qualifier)
  }

  public register<T extends Injectable>(qualifier: string, registration: RegistrationEntry<T>) {

    if (this.registrationFinished) {
      throw new Error(`Trying to register new dependency in '${this.name}'. It is illegal after calling 'finishRegistration()'`)
    }

    if (registration.type !== RegistrationType.TRANSIENT &&
      registration.type !== RegistrationType.CONTAINER &&
      registration.type !== RegistrationType.CONTAINER_EAGER) {
      throw new Error(`Invalid registration type ${registration.type}' for qualifier '${qualifier}'`)
    }

    if (this.registrations.has(qualifier)) {
      console.warn(`Duplicate registration for qualifier '${qualifier}' in container '${this.name}. Container will use the last one.'`)
    }

    this.registrations.set(qualifier, registration)

    if (registration.type === RegistrationType.CONTAINER_EAGER) {
      if (this.eagerDependencies.indexOf(qualifier) === -1) {
        this.eagerDependencies.push(qualifier)
      }
    }
  }

  public clear() {
    this.registrations = new Map()
    this.instances = new Map()
    this.eagerDependencies = []
    this.registrationFinished = false
  }

  private construct<T extends Injectable>(registration: RegistrationEntry<T>, qualifier: string) {
    const instance = registration.factory(this)

    if (registration.type === RegistrationType.CONTAINER || registration.type === RegistrationType.CONTAINER_EAGER) {
      this.instances.set(qualifier, instance as Injectable)
    }

    return instance
  }

  finishRegistration(): Promise<void> {

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
