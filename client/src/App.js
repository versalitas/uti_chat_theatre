import React, {Component} from 'react';
import './App.css';

//TODO substitute TextArea from mui y desinstall this
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import {
  BrowserRouter as Router,
  Routes,Route
} from 'react-router-dom'

import Show from './components/Show.js';
import Director from './components/Director.js';
import Actor from './components/Actor.js';

//TODO can this be used for something else?
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
//TODO this seems obsolete? safe erase?
/*
const PropsRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    <Component {...props} {...rest} />
  )}/>
)
*/
 //TODO extracted from line 66... something for director path?
//toggleAuthenticateStatus={() => this.toggleAuthenticateStatus()} 
class App extends Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        return (
      <Router>
        <Routes>
        <Route exact path="/" element={<Actor/>} />
        <Route exact path="/director" element={<Director/>} />
        <Route exact path="/show" element={<Show/>} />
       </Routes>
      </Router>  
      </MuiThemeProvider>
    );
  }
}

export default App;
