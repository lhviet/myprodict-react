import { combineEpics } from 'redux-observable';
import { epicFetchWordData } from './word';
import { epicFetchPronsOfCurrentWord } from './pron';
import { epicFetchUsagesOfCurrentWord } from './m_usage';
import { epicFetchMeansOfCurrentWord, epicSetCurrentWordWithUsages } from './meaning';
import { epicFetchExamplesOfUsage, epicFetchExamplesOfUsages, epicFetchExamplesOfCurrentWord } from './m_example';
import { epics as wordEpics } from '../ducks/word';
import { epics as userEpics } from '../ducks/user';
import { epics as searchEpics } from '../ducks/search';
import { epics as pronEpics } from '../ducks/pronunciation';
import { epics as meaningEpics } from '../ducks/meaning';
import { epics as meaningUsageEpics } from '../ducks/meaning_usage';
import { epics as meaningUsageExampleEpics } from '../ducks/meaning_usage_example';

export const rootEpic = combineEpics(
  wordEpics,
  userEpics,
  searchEpics,
  pronEpics,
  meaningEpics,
  meaningUsageEpics,
  meaningUsageExampleEpics,
  epicFetchWordData,
  epicFetchPronsOfCurrentWord,
  epicSetCurrentWordWithUsages,
  epicFetchMeansOfCurrentWord,
  epicFetchUsagesOfCurrentWord,
  epicFetchExamplesOfUsage,
  epicFetchExamplesOfUsages,
  epicFetchExamplesOfCurrentWord,
);
