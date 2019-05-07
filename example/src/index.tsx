import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './App'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import {Assembler, Container, ResolverProvider} from 'react-dependency-injection'
import {ASSEMBLIES} from './assembly'

const assembler = new Assembler(ASSEMBLIES, Container.defaultContainer)

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

registerServiceWorker()
