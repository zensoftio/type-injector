# react-dependency-injection

> Decorator-based dependency injection mechanism for projects using React and TypeScript

[![NPM](https://img.shields.io/npm/v/react-dependency-injection.svg)](https://www.npmjs.com/package/react-dependency-injection) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Installation

```bash
npm install --save react-dependency-injection
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

Dependency is any class decorated with `@injectable(...)` that implements `Injectable` interface e.g.

```typescript
import {injectable, Injectable} from 'react-dependency-injection'
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

```typescript

```

### Getting your Dependencies

To inject dependencies into other dependencies use `@injectConstructor`, `@injectProperty`, and/or `@injectMethod` decorators like described below:

```typescript
import {injectable, Injectable, injectConstructor, injectProperty, injectMethod} from 'react-dependency-injection'
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
import {WithDependencies, withDependencies} from 'react-dependency-injection'
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

## License

MIT © [zensoft](https://github.com/zensoft)
