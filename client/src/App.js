import React, { Component } from 'react';
import './App.css';

//TODO substitute TextArea from mui
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom'

import Show from './components/Show.js';
import Director from './components/Director.js';
import Actor from './components/Actor.js';


//import LoginPage from './containers/LoginPage.jsx';
//import LogoutFunction from './containers/LogoutFunction.jsx';
//import Auth from './modules/Auth';

/*
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
*/

const PropsRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    <Component {...props} {...rest} />
  )}/>
)
 //TODO extracted from Actor path... something for director path?
//toggleAuthenticateStatus={() => this.toggleAuthenticateStatus()} 
class App extends Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <Router>
          <div id="container">
            <PropsRoute exact path="/" component={Actor} />
            <PropsRoute path="/Show" component={Show}/>
            <PropsRoute path="/Director" component={Director}/>
           {/* <LoggedOutRoute path="/login" component={LoginPage} toggleAuthenticateStatus={() => this.toggleAuthenticateStatus()} />
            <Route path="/logout" component={LogoutFunction}/> */}
          </div>
        </Router>
      </MuiThemeProvider>
    );
  }
}

export default App;
