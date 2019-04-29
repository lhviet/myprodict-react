import { IWordState } from '^/3_store/ducks/word';
import { IPronState } from '^/3_store/ducks/pronunciation';
import { IMeaningState } from '^/3_store/ducks/meaning';
import { IMeaningUsageState } from '^/3_store/ducks/meaning_usage';
import { IMeaningExampleState } from '^/3_store/ducks/meaning_usage_example';
import { ISearchState } from '^/3_store/ducks/search';
import { IUserState } from '^/3_store/ducks/user';

export interface IStoreState {
  word: IWordState;
  pron: IPronState;
  meaning: IMeaningState;
  meaning_usage: IMeaningUsageState;
  meaning_usage_example: IMeaningExampleState;
  search: ISearchState;
  user: IUserState;
}
