import { ActionsObservable, combineEpics, ofType } from 'redux-observable';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ajax, AjaxError } from 'rxjs/ajax';
import { of } from 'rxjs/internal/observable/of';
import { AnyAction } from 'redux';

import { HOST } from '^/app-configs';

import { createActionDone, createActionFailed, createActionStart } from '^/4_services/action-service';
import { headerJson } from '^/4_services/http-service';

export interface IWordSearchData {
  total: number;
  models: any[];
}
export interface ISearchState {
  isSearching: boolean;
  wordHasPronunciation: IWordSearchData;
  wordHasNoPronunciation: IWordSearchData;
  wordHasNoMeanUsage: IWordSearchData;
}

export const SEARCH_STATE_INIT: ISearchState = {
  isSearching: false,
  wordHasPronunciation: {
    total: 0,
    models: [],
  },
  wordHasNoPronunciation: {
    total: 0,
    models: [],
  },
  wordHasNoMeanUsage: {
    total: 0,
    models: [],
  },
};

// ----- ACTIONS & EPICS ----------------------------------------------------------------------------------------------

export const SEARCH__WORD_HAS_PRON = 'SEARCH__WORD_HAS_PRON';
export const actionSearchWordHasPronunciation = (keyword = '', offset = 0, limit = 30) => {
  const data = {keyword, offset, limit};
  return createActionStart(SEARCH__WORD_HAS_PRON, data);
};
const epicSearchWordHasPronunciation = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${SEARCH__WORD_HAS_PRON}_START`),
  switchMap(({data}) => ajax.post(
    HOST.api.getUrl(HOST.api.search.word_has_pron),
    data,
    headerJson).pipe(
    map(({response}) => createActionDone(SEARCH__WORD_HAS_PRON, response.data)),
    catchError((ajaxError: AjaxError) => of(createActionFailed(SEARCH__WORD_HAS_PRON, ajaxError)))
  )),
);

export const SEARCH__WORD_HAS_NO_PRON = 'SEARCH__WORD_HAS_NO_PRON';
export const actionSearchWordHasNoPronunciation = (keyword = '', offset = 0, limit = 30) => {
  const data = {keyword, offset, limit};
  return createActionStart(SEARCH__WORD_HAS_NO_PRON, data);
};
const epicSearchWordHasNoPronunciation = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${SEARCH__WORD_HAS_NO_PRON}_START`),
  switchMap(({data}) => ajax.post(
    HOST.api.getUrl(HOST.api.search.word_no_pron),
    data,
    headerJson).pipe(
    map(({response}) => createActionDone(SEARCH__WORD_HAS_NO_PRON, response.data)),
    catchError((ajaxError: AjaxError) => of(createActionFailed(SEARCH__WORD_HAS_NO_PRON, ajaxError)))
  )),
);

export const SEARCH__WORD_HAS_NO_MEAN_USAGE = 'SEARCH__WORD_HAS_NO_MEAN_USAGE';
export const actionSearchWordHasNoMeanUsage = (keyword = '', offset = 0, limit = 30) => {
  const data = {keyword, offset, limit};
  return createActionStart(SEARCH__WORD_HAS_NO_MEAN_USAGE, data);
};
const epicSearchWordHasNoMeanUsage = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${SEARCH__WORD_HAS_NO_MEAN_USAGE}_START`),
  switchMap(({data}) => ajax.post(
    HOST.api.getUrl(HOST.api.search.word_no_mean_usage),
    data,
    headerJson).pipe(
    map(({response}) => createActionDone(SEARCH__WORD_HAS_NO_MEAN_USAGE, response.data)),
    catchError((ajaxError: AjaxError) => of(createActionFailed(SEARCH__WORD_HAS_NO_MEAN_USAGE, ajaxError)))
  )),
);

// ----- EPICs --------------------------------------------------------------------------------------------------------

export const epics = combineEpics(
  epicSearchWordHasPronunciation,
  epicSearchWordHasNoPronunciation,
  epicSearchWordHasNoMeanUsage,
);

// ----- REDUCER ------------------------------------------------------------------------------------------------------

/**
 * Process only actions of SEARCH_
 * @param {ISearchState} state
 * @param action
 * @returns {ISearchState}
 */
export default(state = SEARCH_STATE_INIT, action: any): ISearchState => {

  // if this action is not belong to SEARCH, return the original state
  if (action.type.indexOf('SEARCH__') !== 0) {
    return state;
  }

  switch (action.type) {
    case `${SEARCH__WORD_HAS_PRON}_START`:
      return {...state, isSearching: true};
    case `${SEARCH__WORD_HAS_PRON}_DONE`:
      return {
        ...state,
        isSearching: false,
        wordHasPronunciation: action.data,
      };
    case `${SEARCH__WORD_HAS_PRON}_FAILED`:
      return {...state, isSearching: false};

    case `${SEARCH__WORD_HAS_NO_PRON}_START`:
      return {...state, isSearching: true};
    case `${SEARCH__WORD_HAS_NO_PRON}_DONE`:
      return {
        ...state,
        isSearching: false,
        wordHasNoPronunciation: action.data,
      };
    case `${SEARCH__WORD_HAS_NO_PRON}_FAILED`:
      return {...state, isSearching: false};

    case `${SEARCH__WORD_HAS_NO_MEAN_USAGE}_START`:
      return {...state, isSearching: true};
    case `${SEARCH__WORD_HAS_NO_MEAN_USAGE}_DONE`:
      return {
        ...state,
        isSearching: false,
        wordHasNoMeanUsage: action.data,
      };
    case `${SEARCH__WORD_HAS_NO_MEAN_USAGE}_FAILED`:
      return {...state, isSearching: false};

    default:
      return state;
  }
};
