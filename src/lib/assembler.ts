import {Container} from './container'

export interface Assembly {
  assemble(container: Container): void
}

export class Assembler {

  public get resolver() {
    return this.container
  }

  public async assemble() {
    this.assemblies.forEach(assembly => assembly.assemble(this.container))
    await this.container.finishRegistration()
  }

  constructor(private assemblies: Assembly[],
              private container: Container = Container.defaultContainer) {
  }
}
