import React, { Component } from 'react';
import './App.css';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter
} from 'react-router-dom'

import ChatProjector from './components/chatProjector.js';
import ChatDirector from './components/chatDirector.js';
import HomePage from './components/homepage.js';
import LoginPage from './containers/LoginPage.jsx';
import LogoutFunction from './containers/LogoutFunction.jsx';
import Auth from './modules/Auth';
import ChatActor from './components/chatActor.js';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    Auth.isUserAuthenticated() ? (
      <Component {...props} {...rest} />
    ) : (
      <Redirect to={{
        pathname: '/',
        state: { from: props.location }
      }}/>
    )
  )}/>
)

const LoggedOutRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    Auth.isUserAuthenticated() ? (
      <Redirect to={{
        pathname: '/',
        state: { from: props.location }
      }}/>
    ) : (
      <Component {...props} {...rest} />
    )
  )}/>
)

const PropsRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    <Component {...props} {...rest} />
  )}/>
)

class App extends Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <Router>
          <div id="container">
            <PropsRoute exact path="/" component={HomePage} toggleAuthenticateStatus={() => this.toggleAuthenticateStatus()} />
            <PropsRoute path="/chatProjector" component={ChatProjector}/>
            <PropsRoute path="/chatActor" component={ChatActor}/>
            <PropsRoute path="/chatDirector" component={ChatDirector}/>
            <LoggedOutRoute path="/login" component={LoginPage} toggleAuthenticateStatus={() => this.toggleAuthenticateStatus()} />
            <Route path="/logout" component={LogoutFunction}/>
          </div>
        </Router>
      </MuiThemeProvider>
    );
  }
}

export default App;
