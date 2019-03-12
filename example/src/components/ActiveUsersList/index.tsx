import * as React from 'react'
import {injectAware, injectProperty} from 'react-dependency-injection'
import {UserService} from '../../service-layer'

@injectAware()
export default class ActiveUsersList extends React.Component {

  @injectProperty('UserService')
  private userService: UserService

  render() {
    return <div/>
  }
}
