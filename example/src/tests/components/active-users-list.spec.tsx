import * as React from 'react'
import * as Enzyme from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'

import {UserService} from '../../service-layer'
import {ActiveUsersList} from '../../components/ActiveUsersList'

Enzyme.configure({adapter: new Adapter()})

describe('ActiveUsersList', () => {

  it('renders list of users', () => {

    class MockUserService implements UserService {
      awakeAfterInjection() {
      }

      postConstructor() {
      }

      getUsers() {
        return [{
          id: 42,
          username: 'Admin'
        }]
      }
    }

    const mockService = new MockUserService()

    const wrapper = Enzyme.shallow(
      <ActiveUsersList deps={{userService: mockService}}/>
    )

    expect(wrapper.text()).toEqual('Admin')
  })
})
