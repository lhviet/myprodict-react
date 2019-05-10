import { applyMiddleware, createStore } from 'redux';
import rootReducer from './ducks/index';
import { composeWithDevTools } from 'redux-devtools-extension';

export default(middlewares: any[], reducers = rootReducer) => {
  const enhancer = composeWithDevTools(
    applyMiddleware(...middlewares),
    // other store enhancers if any
  );

  return createStore(reducers, enhancer);
};
