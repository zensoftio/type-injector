
export class Assembly {
  constructor(private dependencyLayers: string[]) { }

  async assemble() {

    return Promise.all(this.dependencyLayers.map(layer => require(`./services/${layer}`)))
  }
}

export default Assembly
