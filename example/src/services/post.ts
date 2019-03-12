import {injectable, Injectable} from 'react-dependency-injection'
import {PostService} from '../service-layer'

@injectable('PostService')
export default class DefaultPostService implements PostService, Injectable {

  awakeAfterInjection(): void {
  }

  postConstructor(): void {
  }

}
