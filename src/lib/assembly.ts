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

export class ModuleLoaderAssembly implements Assembly {

  constructor(private moduleNames: string[]) {
  }

  async assemble(container: Container) {
    return Promise.all(this.moduleNames.map((moduleName) => this.loadModuleToContainer(moduleName, container)))
  }

  private loadModuleToContainer(moduleName: string, container: Container): Promise<void> {
    return import(moduleName).then((module) => {
      Object.keys(module).forEach(key => {
        module.hasOwnProperty(key)
        const member = module[key]
        this.registerMemberInContainer(member, container)
      })
    })
  }

  private registerMemberInContainer(member: Injectable, container: Container) {
    const registrations = Reflect.getOwnMetadata(INJECTABLE_REGISTRATION, member)

    if (registrations) {
      Object.keys(registrations).forEach((qualifier: string) => {
        const registration: RegistrationEntry<typeof member> = registrations[qualifier]
        container.register(qualifier, registration)
      })
    }
  }
}
