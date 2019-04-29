import { DbLimitation, IMeaningUsage } from 'myprodict-model/lib-esm';
import * as _ from 'lodash-es';
import { ActionsObservable, combineEpics, ofType } from 'redux-observable';
import { ajax, AjaxError } from 'rxjs/ajax';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { AnyAction } from 'redux';

import { HOST } from '^/app-configs';

import { createActionDone, createActionFailed, createActionStart } from '^/4_services/action-service';
import { headerAuth, headerJson } from '^/4_services/http-service';
import { readToken } from '^/4_services/local-storage-service';

export interface IMeaningUsageState {
  isDeleting: boolean;
  isSaving: boolean;
  isSearching: boolean;
  items: IMeaningUsage[];
}
export const MEANING_USAGE_STATE_INIT: IMeaningUsageState = {
  isDeleting: false,
  isSaving: false,
  isSearching: false,
  items: [],
};

// ----- ACTIONS & EPICS ----------------------------------------------------------------------------------------------

export const MEANING_USAGE__SEARCH = 'MEANING_USAGE__SEARCH';
export const actionSearchUsagesOfWord = (wordKeyids: string[]): AnyAction => {
  const data = {
    limitation: new DbLimitation(),
    filters: { word_keyid: {in: wordKeyids} },
  };
  return createActionStart(MEANING_USAGE__SEARCH, data);
};
const epicSearchUsagesOfWord = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${MEANING_USAGE__SEARCH}_START`),
  switchMap(({data}) => {
    return ajax.post(HOST.api.getUrl(HOST.api.meaning_usage.search), data, headerJson).pipe(
      map(({response}) => createActionDone(MEANING_USAGE__SEARCH, response.data)),
      catchError((ajaxError: AjaxError) => of(createActionFailed(MEANING_USAGE__SEARCH, ajaxError)))
    );
  }),
);

export const MEANING_USAGE__DELETE = 'MEANING_USAGE__DELETE';
export const actionDeleteUsage = (keyid: string) => {
  const data = { keyid };
  return createActionStart(MEANING_USAGE__DELETE, data);
};
const epicDeleteUsage = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${MEANING_USAGE__DELETE}_START`),
  mergeMap(({data}) => ajax.post(
    HOST.api.getUrl(HOST.api.meaning_usage.delete),
    data,
    headerAuth(readToken()),
  ).pipe(
    map(({response}) => createActionDone(MEANING_USAGE__DELETE, response.data)),
    catchError((ajaxError: AjaxError) => of(createActionFailed(MEANING_USAGE__DELETE, ajaxError)))
  )),
);

export const MEANING_USAGE__SAVE = 'MEANING_USAGE__SAVE';
export const actionSaveUsage = (value: IMeaningUsage) => createActionStart(MEANING_USAGE__SAVE, {data: value});
const epicSaveUsage = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${MEANING_USAGE__SAVE}_START`),
  mergeMap(({data}) => ajax.post(
    HOST.api.getUrl(HOST.api.meaning_usage.save),
    data,
    headerAuth(readToken())
  ).pipe(
    map(({response}) => createActionDone(MEANING_USAGE__SAVE, response.data)),
    catchError((ajaxError: AjaxError) => of(createActionFailed(MEANING_USAGE__SAVE, ajaxError)))
  )),
);

// ----- EPICs --------------------------------------------------------------------------------------------------------

export const epics = combineEpics(
  epicSearchUsagesOfWord,
  epicDeleteUsage,
  epicSaveUsage,
);

// ----- REDUCER ------------------------------------------------------------------------------------------------------

/**
 * Process only actions of MEANING_
 * @param {IMeaningUsageState} state
 * @param action
 * @returns {IMeaningUsageState}
 */
export default(state = MEANING_USAGE_STATE_INIT, action: any): IMeaningUsageState => {

  // if this action is not belong to MEANING, return the original state
  if (action.type.indexOf('MEANING_USAGE__') !== 0) {
    return state;
  }

  switch (action.type) {
    case `${MEANING_USAGE__SEARCH}_START`:
      return {...state, isSearching: true};
    case `${MEANING_USAGE__SEARCH}_DONE`:
      const {models} = action.data;
      const mKeyids = models.map((m: any) => m.keyid);
      const items = state.items.filter(item => mKeyids.indexOf(item.keyid) < 0);
      return {...state, items: _.uniq([...items, ...models]), isSearching: false};
    case `${MEANING_USAGE__SEARCH}_FAILED`:
      return {...state, isSearching: false};

    // DELETE ========================================
    case `${MEANING_USAGE__DELETE}_START`:
      return {...state, isDeleting: true};

    case `${MEANING_USAGE__DELETE}_DONE`:
      const keyid = action.data;
      const foundModel = state.items.find(item => item.keyid === keyid);
      if (foundModel) {
        state.items.splice(state.items.indexOf(foundModel), 1);
      }
      return {...state, isDeleting: false};

    case `${MEANING_USAGE__DELETE}_FAILED`:
      return {...state, isDeleting: false};

    // SAVE ========================================
    case `${MEANING_USAGE__SAVE}_START`:
      return {...state, isSaving: true};

    case `${MEANING_USAGE__SAVE}_DONE`:
    case `${MEANING_USAGE__SAVE}_FAILED`:
      return {...state, isSaving: false};

    default:
      return state;
  }
};
