import { DbLimitation, IMeaning } from 'myprodict-model/lib-esm';
import * as _ from 'lodash-es';
import { HOST } from '^/app-configs';
import { ActionsObservable, combineEpics, ofType } from 'redux-observable';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { ajax, AjaxError } from 'rxjs/ajax';
import { AnyAction, Reducer } from 'redux';

import { makeDone, makeFailed, makeStart } from '^/4_services/action-service';
import { readToken } from '^/4_services/local-storage-service';
import { headerAuth, headerJson } from '^/4_services/http-service';

export interface MeaningState {
  isDeleting: boolean;
  isSaving: boolean;
  isSearching: boolean;
  items: IMeaning[];
}

// ----- ACTIONS & EPICS ----------------------------------------------------------------------------------------------

export const MEANING__SEARCH = 'MEANING__SEARCH';
export const actionSearchMeansOfWord = (wordKeyids: string[]): AnyAction => {
  const data = {
    limitation: new DbLimitation(),
    filters: { word_keyid: {in: wordKeyids} },
  };
  return makeStart(MEANING__SEARCH, data);
};
const epicSearchMeansOfWord = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${MEANING__SEARCH}_START`),
  switchMap(({data}) => {
    return ajax.post(HOST.api.getUrl(HOST.api.meaning.search), data, headerJson).pipe(
      map(({response}) => makeDone(MEANING__SEARCH, response.data)),
      catchError((ajaxError: AjaxError) => [makeFailed(MEANING__SEARCH, ajaxError)])
    );
  }),
);

export const MEANING__DELETE = 'MEANING__DELETE';
export const actionDeleteMean = (keyid: string) => {
  const data = { keyid };
  return makeStart(MEANING__DELETE, data);
};
const epicDeleteMean = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${MEANING__DELETE}_START`),
  mergeMap(({data}) => {
    return ajax.post(HOST.api.getUrl(HOST.api.meaning.delete), data, headerAuth(readToken())).pipe(
      map(({response}) => makeDone(MEANING__DELETE, response.data)),
      catchError((ajaxError: AjaxError) => [makeFailed(MEANING__DELETE, ajaxError)])
    );
  }),
);

export const MEANING__SAVE = 'MEANING__SAVE';
export const actionSaveMean = (value: IMeaning) => makeStart(MEANING__SAVE, {data: value});
const epicSaveMean = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${MEANING__SAVE}_START`),
  mergeMap(({data}) => {
    return ajax.post(HOST.api.getUrl(HOST.api.meaning.save), data, headerAuth(readToken())).pipe(
      map(({response}) => makeDone(MEANING__SAVE, response.data)),
      catchError((ajaxError: AjaxError) => [makeFailed(MEANING__SAVE, ajaxError)])
    );
  }),
);

// ----- EPICs --------------------------------------------------------------------------------------------------------

export const epics = combineEpics(
  epicSearchMeansOfWord,
  epicDeleteMean,
  epicSaveMean,
);

// ----- REDUCER ------------------------------------------------------------------------------------------------------
const initialState: MeaningState = {
  isDeleting: false,
  isSaving: false,
  isSearching: false,
  items: [],
};
/**
 * Process only actions of MEANING_
 * @param {MeaningState} state
 * @param action
 * @returns {MeaningState}
 */
const reducer: Reducer<MeaningState> = (state = initialState, action: AnyAction) => {
  // if this action is not belong to MEANING, return the original state
  if (action.type.indexOf('MEANING__') !== 0) {
    return state;
  }

  switch (action.type) {

    // SEARCH ========================================
    case `${MEANING__SEARCH}_START`:
      return {...state, isSearching: true};

    case `${MEANING__SEARCH}_DONE`:
      const {models} = action.data;
      const mKeyids = models.map((model: IMeaning) => model.keyid);
      const items = state.items.filter(item => mKeyids.indexOf(item.keyid) < 0);
      return {...state, items: _.uniq([...items, ...models]), isSearching: false};

    case `${MEANING__SEARCH}_FAILED`:
      return {...state, isSearching: false};

    // DELETE ========================================
    case `${MEANING__DELETE}_START`:
      return {...state, isDeleting: true};

    case `${MEANING__DELETE}_DONE`:
      const keyid = action.data;
      const foundModel = state.items.find(item => item.keyid === keyid);
      if (foundModel) {
        state.items.splice(state.items.indexOf(foundModel), 1);
      }
      return {...state, isDeleting: false};

    case `${MEANING__DELETE}_FAILED`:
      return {...state, isDeleting: false};

    // SAVE ========================================
    case `${MEANING__SAVE}_START`:
      return {...state, isSaving: true};

    case `${MEANING__SAVE}_DONE`:
    case `${MEANING__SAVE}_FAILED`:
      return {...state, isSaving: false};

    default:
      return state;
  }
};
export default reducer;
