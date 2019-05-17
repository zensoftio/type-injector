import {injectable, Injectable} from 'type-injector'
import {UserService} from '../service-layer'

@injectable('UserService')
export default class DefaultUserService implements UserService, Injectable {

  awakeAfterInjection(): void {
  }

  postConstructor(): void {
  }

  // Your useful methods go here
  getUsers() {
    return []
  }
}
