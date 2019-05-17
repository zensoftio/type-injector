import * as React from 'react'
import {ComponentDependencies, withDependencies, WithDependencies} from 'type-injector'
import {UserService} from '../../service-layer'

interface Dependencies extends ComponentDependencies {
  userService: UserService
}

interface Props extends WithDependencies<Dependencies> {

}

export class ActiveUsersList extends React.Component<Props> {

  render() {
    return (
      <div>
        {this.props.deps.userService.getUsers().map(user =>
          <div key={user.id}>
            {user.username}
          </div>
        )}
      </div>
    )
  }
}

export default withDependencies<Dependencies>({
  userService: 'UserService'
})(ActiveUsersList)
