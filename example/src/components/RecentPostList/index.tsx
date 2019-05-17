import * as React from 'react'
import {ComponentDependencies, withDependencies, WithDependencies} from 'type-injector'
import {PostService} from '../../service-layer'

interface Dependencies extends ComponentDependencies {
  postService: PostService
}

interface Props extends WithDependencies<Dependencies> {

}

export class RecentPostList extends React.Component<Props> {

  render() {
    return <div/>
  }
}

export default withDependencies<Dependencies>({
  postService: 'PostService'
})(RecentPostList)
