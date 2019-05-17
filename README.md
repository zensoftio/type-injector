# type-injector

> Decorator-based dependency injection mechanism for projects using React and TypeScript

[![NPM](https://img.shields.io/npm/v/type-injector.svg)](https://www.npmjs.com/package/type-injector) 

## Installation

```bash
npm install --save type-injector
```

Your `tsconfig.json` needs to be configured with the following flags:

```JSON
{
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}
```

## Usage

### Defining Dependencies

Dependency is any class that implements `Injectable` interface and (usually) decorated with `@injectable(...)`

```typescript
import {injectable, Injectable} from 'type-injector'
import {MyService} from '../services'

// Identifiers are mandatory to survive minification.
@injectable('MyService')
export class MyDefaultService implements MyService, Injectable {
  
  postConstructor() {
    // Called after construction of your dependency 
  }
  
  awakeAfterInjection() {
    // Called after all dependencies were successfully injected
  }
}
```

**NOTE:** Your dependencies should be loaded *before* you use them in components or other dependencies. This package does not define the only correct way to accomplish this. One of possible ways is to use an assembly:

### Loading dependencies

Use assemblies and assembler to modularize load your dependencies into container.

Convince way is to use a `ClassLoaderAssembly`:
```typescript
import {ClassLoaderAssembly, RegistrationEntry, RegistrationType} from 'type-injector'
import {Service1, Service2, Service3} from './services'

const SERVICE_ASSEMBLY = new ClassLoaderAssembly([Service1, Service2, Service3])
```

If you need full control over creation of your dependencies, there is a `ManualRegistrationAssembly` class:
```typescript
import {ManualRegistrationAssembly, RegistrationEntry, RegistrationType} from 'type-injector'
import {Service1, Service2} from './services'

const registrations = [ 
  {
    qualifier: 'Service1', 
    entry: new RegistrationEntry(RegistrationType.TRANSIENT, () => new Service1())
  },
  {
    qualifier: 'Service2',
    entry: new RegistrationEntry(RegistrationType.CONTAINER, () => new Service2())
  }
]

export const SERVICES_ASSEMBLY = new ManualRegistrationAssembly(registrations)
```

After that, use `Assembler` to register your dependencies in the container:
```typescript jsx
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './App'
import {Assembler, Container, ResolverProvider} from 'type-injector'
import {SERVICES_ASSEMBLY} from './assemblies'

const assembler = new Assembler([SERVICES_ASSEMBLY], Container.defaultContainer)

assembler.assemble().then(() => {
  ReactDOM.render(
    (
      <ResolverProvider resolver={assembler.resolver}>
        <App/>
      </ResolverProvider>
    ),
    document.getElementById('root') as HTMLElement
  )
})
```

### Getting your Dependencies

To inject dependencies into other dependencies use `@injectConstructor`, `@injectProperty`, and/or `@injectMethod` decorators like described below:

```typescript
import {injectable, Injectable, injectConstructor, injectProperty, injectMethod} from 'type-injector'
import {Fetcher, MyService, MyOtherService, MyThirdService} from '../services'

@injectable('MyService')
export class MyDefaultService implements MyService, Injectable {

  // Identifiers are mandatory to survive minification.
  @injectProperty('MyOtherService')
  private myOtherService: MyOtherService
  
  private myThirdService: MyThirdService
  
  // Identifiers are mandatory to survive minification.
  @injectMethod('MyThirdService')
  setThirdService(service: MyThirdService) {
    this.myThirdService = service
  }
  
  constructor(@injectConstructor('Fetcher') private fetcher: Fetcher) {}
  
  postConstructor() {
    this.fetcher.prime()
  }
   
  awakeAfterInjection() {
    this.myOtherService.register(this)
  }
}
```

For components, use `WithDependencies` interface to declare props and `withDependencies` HOC to export component:

```typescript jsx
import * as React from 'react'
import {WithDependencies, withDependencies} from 'type-injector'
import {UserService} from '../services'

interface MyDependencies {
  userService: UserService
}

interface UserListProps extends WithDependencies<MyDependencies> {
  isEditable: boolean
}

export class MyUserList extends React.Component<UserListProps> {
  
  render() {
    return (
      <div>
        {this.props.deps.userService.getActiveUsres().map(user =>
          <UserComponent key={user.id} isEditable={this.props.isEditable} user={user} /> 
        )}
      </div>
    )
  }
}

export default withDependencies({})(MyUserList)
```

## Testing

To test your components, import them without `withDependencies` HOC and mock there deps popr:

```typescript jsx
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
```

If you need to test deeper hierarchy, provide a mock container:

```typescript jsx
import {
  Container, TestDependencyProvider, RegistrationEntry, RegistrationType
} from 'type-injector'

import * as React from 'react'
import * as Enzyme from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'

import {UserService} from '../../service-layer'
import ActiveUsersList from '../../components/ActiveUsersList'

Enzyme.configure({adapter: new Adapter()})

describe('ActiveUsersList', () => {

  const testContainerName = 'TestContainer'

  it('renders list of users', () => {
    class MockUserService implements UserService {
      awakeAfterInjection() {}
      postConstructor() {}

      getUsers() {
        return [{
          id: 42,
          username: 'Admin'
        }]
      }
    }

    const testContainer = new Container(testContainerName)
    testContainer.register(
      'UserService',
      new RegistrationEntry<UserService>(RegistrationType.TRANSIENT, () => new MockUserService())
    )

    const wrapper = Enzyme.mount(
      <DependencyProvider container={testContainer}>
        <ActiveUsersList/>
      </DependencyProvider>
    )
    expect(wrapper.text()).toEqual('Admin')
  })
})
``` 

## License

MIT © [Zensoft IO, LLC](https://github.com/zensoftio)
