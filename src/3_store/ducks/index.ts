import { combineReducers } from 'redux';
import word from './word';
import pron from './pronunciation';
import meaning from './meaning';
import meaning_usage from './meaning_usage';
import meaning_usage_example from './meaning_usage_example';
import user from './user';
import search from './search';

export default combineReducers({
  word,
  pron,
  meaning,
  meaning_usage,
  meaning_usage_example,
  search,
  user,
});
