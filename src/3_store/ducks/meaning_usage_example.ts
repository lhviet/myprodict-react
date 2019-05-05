import * as _ from 'lodash-es';
import { DbLimitation, IMeaningExample } from 'myprodict-model/lib-esm';
import { ActionsObservable, combineEpics, ofType } from 'redux-observable';
import { ajax, AjaxError } from 'rxjs/ajax';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { AnyAction } from 'redux';

import { HOST } from '^/app-configs';

import { ITermExample } from '^/3_store/interfaces';
import { createActionDone, createActionFailed, createActionStart } from '^/4_services/action-service';
import { headerAuth, headerJson } from '^/4_services/http-service';
import { readToken } from '^/4_services/local-storage-service';

export interface IMeaningExampleState {
  isDeleting: boolean;
  isSaving: boolean;
  isSearching: boolean;
  items: IMeaningExample[];
  termExamples: ITermExample[];
}
export const MEANING_USAGE_EXAMPLE_STATE_INIT: IMeaningExampleState = {
  isDeleting: false,
  isSaving: false,
  isSearching: false,
  items: [],
  termExamples: [],
};

// ----- ACTIONS & EPICS ----------------------------------------------------------------------------------------------

export const MEANING_USAGE_EXAMPLE__SEARCH_OF_USAGES = 'MEANING_USAGE_EXAMPLE__SEARCH_OF_USAGES';
export const actionSearchExamplesOfUsage = (uKeyids: string[]): AnyAction => {
  const data = {
    limitation: new DbLimitation(),
    filters: { meaning_usage_keyid: {in: uKeyids} },
  };
  return createActionStart(MEANING_USAGE_EXAMPLE__SEARCH_OF_USAGES, data);
};
const epicSearchExamplesOfUsage = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${MEANING_USAGE_EXAMPLE__SEARCH_OF_USAGES}_START`),
  switchMap(({data}) => {
    return ajax.post(HOST.api.getUrl(HOST.api.meaning_usage_example.search), data, headerJson).pipe(
      map(({response}) => createActionDone(MEANING_USAGE_EXAMPLE__SEARCH_OF_USAGES, response.data)),
      catchError((ajaxError: AjaxError) => [createActionFailed(MEANING_USAGE_EXAMPLE__SEARCH_OF_USAGES, ajaxError)])
    );
  }),
);

export const MEANING_USAGE_EXAMPLE__SEARCH_TERM = 'MEANING_USAGE_EXAMPLE__SEARCH_TERM';
export const actionSearchExamples = (term: string): AnyAction => {
  const data = {
    limitation: new DbLimitation(0, 120),
    filters: { sentence: `% ${term} %` },
  };
  return createActionStart(MEANING_USAGE_EXAMPLE__SEARCH_TERM, data);
};
const epicSearchExamples = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${MEANING_USAGE_EXAMPLE__SEARCH_TERM}_START`),
  switchMap(({data}) => {
    return ajax.post(HOST.api.getUrl(HOST.api.meaning_usage_example.search), data, headerJson).pipe(
      map(({response}) => createActionDone(MEANING_USAGE_EXAMPLE__SEARCH_TERM, response.data)),
      catchError((ajaxError: AjaxError) => [createActionFailed(MEANING_USAGE_EXAMPLE__SEARCH_TERM, ajaxError)])
    );
  }),
);

export const MEANING_USAGE_EXAMPLE__DELETE = 'MEANING_USAGE_EXAMPLE__DELETE';
export const actionDeleteExample = (keyid: string) => {
  const data = { keyid };
  return createActionStart(MEANING_USAGE_EXAMPLE__DELETE, data);
};
const epicDeleteExample = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${MEANING_USAGE_EXAMPLE__DELETE}_START`),
  mergeMap(({data}) => ajax.post(
    HOST.api.getUrl(HOST.api.meaning_usage_example.delete),
    data,
    headerAuth(readToken())
  ).pipe(
    map(({response}) => createActionDone(MEANING_USAGE_EXAMPLE__DELETE, response.data)),
    catchError((ajaxError: AjaxError) => [createActionFailed(MEANING_USAGE_EXAMPLE__DELETE, ajaxError)])
  )),
);

export const MEANING_USAGE_EXAMPLE__SAVE = 'MEANING_USAGE_EXAMPLE__SAVE';
export const actionSaveExample = (value: IMeaningExample) => createActionStart(
  MEANING_USAGE_EXAMPLE__SAVE,
  {data: value},
);
const epicSaveExample = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${MEANING_USAGE_EXAMPLE__SAVE}_START`),
  mergeMap(({data}) => ajax.post(
    HOST.api.getUrl(HOST.api.meaning_usage_example.save),
    data,
    headerAuth(readToken())
  ).pipe(
    map(({response}) => createActionDone(MEANING_USAGE_EXAMPLE__SAVE, response.data)),
    catchError((ajaxError: AjaxError) => [createActionFailed(MEANING_USAGE_EXAMPLE__SAVE, ajaxError)])
  )),
);

// ----- EPICs --------------------------------------------------------------------------------------------------------

export const epics = combineEpics(
  epicSearchExamplesOfUsage,
  epicSearchExamples,
  epicDeleteExample,
  epicSaveExample,
);

// ----- REDUCER ------------------------------------------------------------------------------------------------------

/**
 * Process only actions of MEANING_
 * @param {IMeaningExampleState} state
 * @param action
 * @returns {IMeaningExampleState}
 */
export default(state = MEANING_USAGE_EXAMPLE_STATE_INIT, action: any): IMeaningExampleState => {

  // if this action is not belong to MEANING, return the original state
  if (action.type.indexOf('MEANING_USAGE_EXAMPLE__') !== 0) {
    return state;
  }

  switch (action.type) {
    // SEARCH EXAMPLES OF USAGE ========================================
    case `${MEANING_USAGE_EXAMPLE__SEARCH_OF_USAGES}_START`:
      return {...state, isSearching: true};
    case `${MEANING_USAGE_EXAMPLE__SEARCH_OF_USAGES}_DONE`:
      const mKeyids = action.data.models.map((m: any) => m.keyid);
      const items = state.items.filter(item => mKeyids.indexOf(item.keyid) < 0);
      return {...state, items: _.uniq([...items, ...action.data.models]), isSearching: false};
    case `${MEANING_USAGE_EXAMPLE__SEARCH_OF_USAGES}_FAILED`:
      return {...state, isSearching: false};

    // SEARCH EXAMPLES BY KEYWORD ========================================
    case `${MEANING_USAGE_EXAMPLE__SEARCH_TERM}_START`:
      return {...state, isSearching: true};
    case `${MEANING_USAGE_EXAMPLE__SEARCH_TERM}_DONE`:
      const examples = action.data.models.map((m: IMeaningExample) => m.value.sentence);
      const termExample = state.termExamples.find(te => te.term === action.data.term);
      if (termExample !== undefined) {
        termExample.examples = examples;
      } else {
        // removing % symbols from `%term%`
        let pTerm = action.data.term;
        if (_.startsWith(pTerm, '%')) {
          pTerm = pTerm.substr(1);
        }
        if (_.endsWith(pTerm, '%')) {
          pTerm = pTerm.substr(0, pTerm.length - 1);
        }
        state.termExamples.push({term: pTerm.trim(), examples});
      }
      return {...state, isSearching: false};
    case `${MEANING_USAGE_EXAMPLE__SEARCH_TERM}_FAILED`:
      return {...state, isSearching: false};

    // DELETE ========================================
    case `${MEANING_USAGE_EXAMPLE__DELETE}_START`:
      return {...state, isDeleting: true};

    case `${MEANING_USAGE_EXAMPLE__DELETE}_DONE`:
      const keyid = action.data;
      const foundModel = state.items.find(item => item.keyid === keyid);
      if (foundModel) {
        state.items.splice(state.items.indexOf(foundModel), 1);
      }
      return {...state, isDeleting: false};

    case `${MEANING_USAGE_EXAMPLE__DELETE}_FAILED`:
      return {...state, isDeleting: false};

    // SAVE ========================================
    case `${MEANING_USAGE_EXAMPLE__SAVE}_START`:
      return {...state, isSaving: true};

    case `${MEANING_USAGE_EXAMPLE__SAVE}_DONE`:
    case `${MEANING_USAGE_EXAMPLE__SAVE}_FAILED`:
      return {...state, isSaving: false};

    default:
      return state;

  }
};
