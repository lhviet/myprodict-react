import { Action } from 'redux';
import { ActionsObservable, StateObservable } from 'redux-observable';
import { filter, map } from 'rxjs/operators';
import { MEANING_USAGE__SAVE, actionSearchUsagesOfWord } from '../ducks/meaning_usage';
import { StoreState } from '^/types';

// reloading Meanings of current Word after a Mean save/submitted
export const epicFetchUsagesOfCurrentWord = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<StoreState>,
) => {
  return action$.pipe(
    filter(action =>
      action.type === `${MEANING_USAGE__SAVE}_DONE`
    ),
    map(() => {
      const {currentWordKeyid} = state$.value.word;
      return actionSearchUsagesOfWord([currentWordKeyid]);
    })
  );
};
