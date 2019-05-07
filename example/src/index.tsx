import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './App'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import {Assembler, Container, ContainerProvider} from 'react-dependency-injection'
import {ASSEMBLIES} from './assembly'

const assembler = new Assembler(ASSEMBLIES, Container.defaultContainer)

assembler.assemble().then(() => {
  ReactDOM.render(
    (
      <ContainerProvider resolver={assembler.resolver}>
        <App/>
      </ContainerProvider>
    ),
    document.getElementById('root') as HTMLElement
  )
})

registerServiceWorker()
