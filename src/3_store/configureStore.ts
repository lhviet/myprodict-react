import { applyMiddleware, createStore } from 'redux';
import { IStoreState } from '^/types';
import rootReducer from './ducks/index';
import { composeWithDevTools } from 'redux-devtools-extension';
import { WORD_STATE_INIT } from './ducks/word';
import { MEANING_STATE_INIT } from './ducks/meaning';
import { USER_STATE_INIT } from './ducks/user';
import { MEANING_USAGE_STATE_INIT } from './ducks/meaning_usage';
import { PRON_STATE_INIT } from './ducks/pronunciation';
import { SEARCH_STATE_INIT } from './ducks/search';
import { MEANING_USAGE_EXAMPLE_STATE_INIT } from './ducks/meaning_usage_example';

export const INITIAL_STATE: IStoreState = {
  word: WORD_STATE_INIT,
  pron: PRON_STATE_INIT,
  meaning: MEANING_STATE_INIT,
  meaning_usage: MEANING_USAGE_STATE_INIT,
  meaning_usage_example: MEANING_USAGE_EXAMPLE_STATE_INIT,
  search: SEARCH_STATE_INIT,
  user: USER_STATE_INIT,
};

export default(middlewares: any[], initialState: any = {...INITIAL_STATE}, reducers = rootReducer) => {

  const enhancer = composeWithDevTools(
    applyMiddleware(...middlewares),
    // other store enhancers if any
  );

  return createStore(reducers, initialState, enhancer);
};
