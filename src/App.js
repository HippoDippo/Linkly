import React, { Component } from 'react';
import './App.css';
import Profile from './components/Profile';
import { Switch, Route } from 'react-router-dom';
import NavBar from './components/NavBar';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Switch>
          <Route path="/" component={Profile} />
          {/* <Route path="/profile" component={Profile} /> */}
        </Switch>
      </div>
    );
  }
}

export default App;