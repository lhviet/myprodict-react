import { Route } from 'react-router-dom';
import * as React from 'react';
import { Redirect } from 'react-router';

interface AuthenticatedRouteProps {
  isLoggedIn: boolean;
  path: string;
  component?: any;
  redirectToUrl: string;
}

interface AuthenticatedRouteState {
}

class AuthenticatedRoute extends React.Component<AuthenticatedRouteProps, AuthenticatedRouteState> {
  render() {
    const { isLoggedIn, redirectToUrl } = this.props;
    return isLoggedIn ?
      <Route exact={true} {...this.props} /> :
      <Redirect to={redirectToUrl}/>;
  }
}

export default AuthenticatedRoute;
