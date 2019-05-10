import { Action } from 'redux';
import { ActionsObservable, ofType, StateObservable } from 'redux-observable';
import { map } from 'rxjs/operators';
import { PRON__SAVE, actionSearchPronOfWord } from '../ducks/pronunciation';
import { StoreState } from '^/types';

// reloading Pronunciations of current Word after a Pron save/submitted
export const epicFetchPronsOfCurrentWord = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<StoreState>,
) => {
  return action$.pipe(
    ofType(`${PRON__SAVE}_DONE`),
    map(() => {
      const {currentWordKeyid} = state$.value.word;
      return actionSearchPronOfWord([currentWordKeyid]);
    })
  );
};
