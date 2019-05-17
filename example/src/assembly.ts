import {ClassLoaderAssembly} from 'type-injector'
import DefaultPostService from './services/post'
import DefaultUserService from './services/user'

const SERVICE_LAYERS = [
  DefaultPostService,
  DefaultUserService
]

export const ASSEMBLIES = [new ClassLoaderAssembly(SERVICE_LAYERS)]
