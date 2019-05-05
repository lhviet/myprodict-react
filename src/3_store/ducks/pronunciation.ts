import { DbLimitation, IPronunciation } from 'myprodict-model/lib-esm';
import * as _ from 'lodash-es';
import { ActionsObservable, combineEpics, ofType } from 'redux-observable';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { ajax, AjaxError } from 'rxjs/ajax';
import { AnyAction } from 'redux';

import { HOST } from '^/app-configs';

import { createActionDone, createActionFailed, createActionStart } from '^/4_services/action-service';
import { headerAuth, headerJson } from '^/4_services/http-service';
import { readToken } from '^/4_services/local-storage-service';

export interface IPronState {
  isDeleting: boolean;
  isSaving: boolean;
  isSearching: boolean;
  items: IPronunciation[];
}
export const PRON_STATE_INIT: IPronState = {
  isDeleting: false,
  isSaving: false,
  isSearching: false,
  items: [],
};

// ----- ACTIONS & EPICS ----------------------------------------------------------------------------------------------

export const PRON__DELETE = 'PRON__DELETE';
export const actionDeletePron = (keyid: string) => {
  const data = { keyid };
  return createActionStart(PRON__DELETE, data);
};
const epicDeletePron = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${PRON__DELETE}_START`),
  mergeMap(({data}) => {
    return ajax.post(HOST.api.getUrl(HOST.api.pron.delete), data, headerAuth(readToken())).pipe(
      map(({response}) => createActionDone(PRON__DELETE, response.data)),
      catchError((ajaxError: AjaxError) => [createActionFailed(PRON__DELETE, ajaxError)])
    );
  }),
);

export const PRON__FETCH = 'PRON__FETCH';
export const actionFetchPron = (keyid: string) => {
  const data = { keyid };
  return createActionStart(PRON__FETCH, data);
};
const epicFetchPron = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${PRON__FETCH}_START`),
  mergeMap(({data}) => {
    return ajax.post(HOST.api.getUrl(HOST.api.pron.search), data, headerJson).pipe(
      map(({response}) => createActionDone(PRON__FETCH, response.data)),
      catchError((ajaxError: AjaxError) => [createActionFailed(PRON__FETCH, ajaxError)])
    );
  }),
);

export const PRON__SAVE = 'PRON__SAVE';
export const actionSavePron = (value: IPronunciation) => createActionStart(PRON__SAVE, {data: value});
const epicSavePron = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${PRON__SAVE}_START`),
  mergeMap(({data}) => {
    return ajax.post(HOST.api.getUrl(HOST.api.pron.save), data, headerAuth(readToken())).pipe(
      map(({response}) => createActionDone(PRON__SAVE, response.data)),
      catchError((ajaxError: AjaxError) => [createActionFailed(PRON__SAVE, ajaxError)])
    );
  }),
);

export const PRON__OF_WORD_FETCH = 'PRON__OF_WORD_FETCH';
export const actionSearchPronOfWord = (wordKeyids: string[]): AnyAction => {
  const data = {
    limitation: new DbLimitation(),
    filters: { word_keyid: {in: wordKeyids} },
  };
  return createActionStart(PRON__OF_WORD_FETCH, data);
};
const epicSearchPronOfWord = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${PRON__OF_WORD_FETCH}_START`),
  switchMap(({data}) => {
    return ajax.post(HOST.api.getUrl(HOST.api.pron.search), data, headerJson).pipe(
      map(({response}) => createActionDone(PRON__OF_WORD_FETCH, response.data)),
      catchError((ajaxError: AjaxError) => [createActionFailed(PRON__OF_WORD_FETCH, ajaxError)])
    );
  }),
);

// ----- EPICs --------------------------------------------------------------------------------------------------------

export const epics = combineEpics(
  epicDeletePron,
  epicFetchPron,
  epicSavePron,
  epicSearchPronOfWord,
);

// ----- REDUCER ------------------------------------------------------------------------------------------------------

/**
 * Process only actions of PRON_
 * @param {IPronState} state
 * @param action
 * @returns {IPronState}
 */
export default(state = PRON_STATE_INIT, action: any): IPronState => {

  // if this action is not belong to PRON, return the original state
  if (action.type.indexOf('PRON__') !== 0) {
    return state;
  }

  switch (action.type) {

    // SEARCH ========================================
    case `${PRON__OF_WORD_FETCH}_START`:
      return {...state, isSearching: true};

    case `${PRON__OF_WORD_FETCH}_DONE`:
      const {models} = action.data;
      const mKeyids = models.map((m: any) => m.keyid);
      const items = state.items.filter(item => mKeyids.indexOf(item.keyid) < 0);
      return {...state, items: _.uniq([...items, ...models]), isSearching: false};

    case `${PRON__OF_WORD_FETCH}_FAILED`:
      return {...state, items: [], isSearching: false};

    // DELETE ========================================
    case `${PRON__DELETE}_START`:
      return {...state, isDeleting: true};

    case `${PRON__DELETE}_DONE`:
      const keyid = action.data;
      const foundModel = state.items.find(item => item.keyid === keyid);
      if (foundModel) {
        state.items.splice(state.items.indexOf(foundModel), 1);
      }
      return {...state, isDeleting: false};
    case `${PRON__DELETE}_FAILED`:
      return {...state, isDeleting: false};

    // SAVE ========================================
    case `${PRON__SAVE}_START`:
      return {...state, isSaving: true};

    case `${PRON__SAVE}_DONE`:
    case `${PRON__SAVE}_FAILED`:
      return {...state, isSaving: false};
    default:
      return state;

  }
};
