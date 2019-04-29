import { Action, AnyAction } from 'redux';
import { ActionsObservable, ofType, StateObservable } from 'redux-observable';
import { filter, map, switchMap } from 'rxjs/operators';
import * as _ from 'lodash-es';
import { MEANING__SAVE, MEANING__SEARCH, actionSearchMeansOfWord } from '../ducks/meaning';
import { IStoreState } from '^/types';
import { of } from 'rxjs/internal/observable/of';
import { actionSetCurrentWordId } from '../ducks/word';
import { actionSearchExamples } from '../ducks/meaning_usage_example';

// after MEANING__SEARCH DONE, set the current word to display first in the homepage list
export const epicSetCurrentWordWithUsages = (
  action$: ActionsObservable<AnyAction>,
  state$: StateObservable<IStoreState>
) => action$.pipe(
  ofType(`${MEANING__SEARCH}_DONE`) ,
  switchMap(({ data }) => {
    const { models } = data;
    if (models.length) {
      const currentWord: any = _.find(state$.value.word.searchResult.models, {keyid: models[0].value.word_keyid});
      if (currentWord) {
        return of(
          actionSetCurrentWordId(currentWord.keyid),
          actionSearchExamples(currentWord.value.word),
        );
      }
    }
    return of({type: 'done'});
  })
);

// reloading Meanings of current Word after a Mean save/submitted
export const epicFetchMeansOfCurrentWord = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<IStoreState>,
) => action$.pipe(
  filter((action: any) =>
    action.type === `${MEANING__SAVE}_DONE`
  ),
  map(() => {
    const {currentWordKeyid} = state$.value.word;
    return actionSearchMeansOfWord([currentWordKeyid]);
  })
);
