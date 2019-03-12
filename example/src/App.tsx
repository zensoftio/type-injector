import * as React from 'react'
import RecentPostList from './components/RecentPostList'
import ActiveUsersList from './components/ActiveUsersList'

class App extends React.Component {

  public render() {

    return (
      <div className='container'>
        <main className='content'>
          <header className='header'>
            Recent posts
          </header>
          <RecentPostList/>
        </main>
        <aside className='sidebar'>
          <header className='header'>
            Most active users
          </header>
          <ActiveUsersList/>
        </aside>
      </div>
    )
  }
}

export default App
