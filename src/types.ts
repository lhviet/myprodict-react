import { WordState } from '^/3_store/ducks/word';
import { PronState } from '^/3_store/ducks/pronunciation';
import { MeaningState } from '^/3_store/ducks/meaning';
import { MeaningUsageState } from '^/3_store/ducks/meaning_usage';
import { MeaningExampleState } from '^/3_store/ducks/meaning_usage_example';
import { SearchState } from '^/3_store/ducks/search';
import { UserState } from '^/3_store/ducks/user';
import { ReadAloudState } from '^/3_store/ducks/read_aloud';

export interface StoreState {
  word: WordState;
  pron: PronState;
  meaning: MeaningState;
  meaningUsage: MeaningUsageState;
  meaningExample: MeaningExampleState;
  search: SearchState;
  user: UserState;
  readAloud: ReadAloudState;
}

export interface TermExample {
  term: string;
  examples: string[];
}

export enum FetchStatus {
  IDLE = 1,
  FETCHING,
  SUCCESS,
  FAIL,
}