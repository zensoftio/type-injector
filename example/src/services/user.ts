import {injectable, Injectable} from 'react-dependency-injection'
import {UserService} from '../service-layer'

@injectable('UserService')
export default class DefaultUserService implements UserService, Injectable {

  awakeAfterInjection(): void {
  }

  postConstructor(): void {
  }

}
