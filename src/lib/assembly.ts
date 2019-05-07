import {Assembly} from './assembler'
import {Container, Injectable, RegistrationEntry} from './container'
import {INJECTABLE_REGISTRATION} from './dependency-injection'

export interface ManualRegistrationEntry<T extends Injectable> {
  qualifier: string
  entry: RegistrationEntry<T>
}

export class ManualRegistrationAssembly implements Assembly {

  constructor(private registrations: Array<ManualRegistrationEntry<Injectable>>) {
  }

  assemble(container: Container) {
    this.registrations.forEach((registration) => container.register(registration.qualifier, registration.entry))
  }
}

export class ClassLoaderAssembly implements Assembly {

  constructor(private classes: any[]) {
  }

  async assemble(container: Container) {
    this.classes.forEach((member) => this.registerMemberInContainer(member, container))
  }

  private registerMemberInContainer(member: any, container: Container) {
    const registrations = Reflect.getOwnMetadata(INJECTABLE_REGISTRATION, member)

    if (registrations) {
      Object.keys(registrations).forEach((qualifier: string) => {
        const registration: RegistrationEntry<typeof member> = registrations[qualifier]
        container.register(qualifier, registration)
      })
    }
  }
}
