import { combineReducers, AnyAction } from 'redux';

import { StoreState } from '^/types';

import wordReducer from './word';
import pronReducer from './pronunciation';
import meaningReducer from './meaning';
import meaningUsageReducer from './meaning_usage';
import meaningUsageExampleReducer from './meaning_usage_example';
import userReducer from './user';
import searchReducer from './search';
import readAloudReducer from './read_aloud';

export default combineReducers<StoreState, AnyAction>({
  word: wordReducer,
  pron: pronReducer,
  meaning: meaningReducer,
  meaningUsage: meaningUsageReducer,
  meaningExample: meaningUsageExampleReducer,
  search: searchReducer,
  user: userReducer,
  readAloud: readAloudReducer,
});
