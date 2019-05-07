import {Container, Resolver} from './container'

/**
 * Implement this interface to build your own dependency assemblies
 */
export interface Assembly {
  /**
   * This method is called on assembly by assembler to register dependencies in provided container
   * @param {Container} container, container to register dependencies in
   */
  assemble(container: Container): void
}

/**
 * Convince way to split dependency registration into a more modular structure.
 * Accepts a container as input and provides it as a resolver.
 */
export class Assembler {

  /**
   * Your container goes by this name
   * @returns {Resolver}
   */
  public get resolver(): Resolver {
    return this.container
  }

  /**
   * Assembles dependencies into container.
   * Runs assemblies one by one and registers their dependencies.
   * Finishes registration in container after all assemblies are loaded
   * @returns {void}
   */
  public async assemble() {
    this.assemblies.forEach(assembly => assembly.assemble(this.container))
    await this.container.finishRegistration()
    return
  }

  /**
   * Constructor
   * @param {Assembly[]} assemblies, assemblies to load
   * @param {Container} container, container to load assemblies into
   */
  constructor(private assemblies: Assembly[],
              private container: Container = Container.defaultContainer) {
  }
}
