import * as React from 'react'
import {injectAware, injectProperty} from 'react-dependency-injection'
import {PostService} from '../../service-layer'

@injectAware()
export default class RecentPostList extends React.Component {

  @injectProperty('PostService')
  private postService: PostService

  render() {
    return <div/>
  }
}
