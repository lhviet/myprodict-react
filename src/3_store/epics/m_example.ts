import { Action } from 'redux';
import { ActionsObservable, StateObservable } from 'redux-observable';
import { filter, map } from 'rxjs/operators';
import { MEANING_USAGE__SEARCH } from '../ducks/meaning_usage';
import { MEANING_USAGE_EXAMPLE__SAVE, actionSearchExamplesOfUsage } from '../ducks/meaning_usage_example';
import { IStoreState } from '^/types';

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
export const epicFetchExamplesOfUsages = (action$: ActionsObservable<Action>, state$: StateObservable<IStoreState>) => {
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
