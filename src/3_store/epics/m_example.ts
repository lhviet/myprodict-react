import * as _ from 'lodash-es';
import { Action, AnyAction } from 'redux';
import { ActionsObservable, StateObservable } from 'redux-observable';
import { filter, map } from 'rxjs/operators';
import { IWord } from 'myprodict-model/lib-esm';

import { IStoreState } from '^/types';

import { MEANING_USAGE__SEARCH } from '^/3_store/ducks/meaning_usage';
import {
  MEANING_USAGE_EXAMPLE__SAVE,
  actionSearchExamplesOfUsage,
  actionSearchExamples
} from '^/3_store/ducks/meaning_usage_example';
import { WORD__SET_CURRENT } from '^/3_store/ducks/word';

export const epicFetchExamplesOfCurrentWord = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<IStoreState>
) => {
  return action$.pipe(
    filter(action => action.type === `${WORD__SET_CURRENT}`),
    map(({ data: wordKeyid }: AnyAction) => {
      const word = _.find(state$.value.word.searchResult.models, { keyid: wordKeyid }) as IWord;
      const examples = state$.value.meaning_usage_example.termExamples;
      if (
        word &&
        examples.length > 0 &&
        _.find(examples, { term: word.value.word }) === undefined) {
        return actionSearchExamples(word.value.word);
      }
      return {type: 'done'};
    })
  );
};

export const epicFetchExamplesOfUsage = (action$: ActionsObservable<Action>) => {
  return action$.pipe(
    filter(action =>
      action.type === `${MEANING_USAGE__SEARCH}_DONE`
    ),
    map((action: any) => {
      const {models} = action.data;
      return models && models.length > 0 ?
        actionSearchExamplesOfUsage(models.map((u: any) => u.keyid))
        : {type: 'done'};
    })
  );
};

// reloading Meanings of current Word after a Mean save/submitted
export const epicFetchExamplesOfUsages = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<IStoreState>
) => {
  return action$.pipe(
    filter(action =>
      action.type === `${MEANING_USAGE_EXAMPLE__SAVE}_DONE`
    ),
    map(() => {
      const { items } = state$.value.meaning_usage;
      return actionSearchExamplesOfUsage(items.map((item: any) => item.keyid));
    })
  );
};
