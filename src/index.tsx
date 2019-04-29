import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { createEpicMiddleware } from 'redux-observable';

import App from '^/App';
import PageHome from '^/2_containers/pages/PageHome';

// redux-observable epics
import { rootEpic } from '^/3_store/epics';
import configureStore from '^/3_store/configureStore';

import * as serviceWorker from '^/serviceWorker';
import '^/index.scss';

const epicMiddleware = createEpicMiddleware();

// Build the middleware for intercepting and dispatching navigation actions
const middlewares = [
  epicMiddleware,
];

// console.log('ENVIRONMENT = ', process.env.NODE_ENV);
if (process.env.NODE_ENV === `development`) {
  const reduxLogger = require('redux-logger');
  const logger = reduxLogger.createLogger({
    collapsed: true,
  });
  middlewares.push(logger);
}

const store = configureStore(middlewares);

epicMiddleware.run(rootEpic);

ReactDOM.hydrate(
  (
    <Provider store={store}>
      <Router>
        <div>
          <Route exact={true} path="/app" component={App}/>
          <Route exact={true} path="/" component={PageHome}/>
        </div>
      </Router>
    </Provider>
  ),
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
