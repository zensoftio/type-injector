import * as React from 'react'
import {injectAware, injectProperty} from 'react-dependency-injection'
import './App.css'
import logo from './logo.svg'
import Service from './service'

@injectAware()
class App extends React.Component {

  @injectProperty('Service')
  private service: Service

  public render() {

    const greeting = this.service.value

    return (
      <div className='App'>
        <header className='App-header'>
          <img src={logo} className='App-logo' alt='logo'/>
          <h1 className='App-title'>Welcome to React</h1>
        </header>
        <p className='App-intro'>
          {greeting}
        </p>
      </div>
    )
  }
}

export default App
