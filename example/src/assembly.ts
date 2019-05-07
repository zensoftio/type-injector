import {ModuleLoaderAssembly} from 'react-dependency-injection'

const SERVICE_LAYERS = ['post', 'user'].map(layerName => './service/' + layerName)

export const ASSEMBLIES = [new ModuleLoaderAssembly(SERVICE_LAYERS)]
