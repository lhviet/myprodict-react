import * as _ from 'lodash-es';
import { DbLimitation, IWord } from 'myprodict-model/lib-esm';
import { AnyAction, Reducer } from 'redux';
import { ActionsObservable, combineEpics, ofType } from 'redux-observable';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { ajax, AjaxError } from 'rxjs/ajax';

import { HOST } from '^/app-configs';

import { makeDone, makeFailed, makeStart } from '^/4_services/action-service';
import { headerAuth, headerJson } from '^/4_services/http-service';
import { readToken } from '^/4_services/local-storage-service';

export interface WordState {
  words: IWord[];

  currentWordKeyid: string;

  isWordExisting: boolean;
  isWordChecking: boolean;
  isUrlExisting: boolean;
  isUrlChecking: boolean;
  isSaving: boolean;
  isFetchingWord: boolean;
  isSearching: boolean;
}

// ----- ACTIONS & EPICS ----- //

export const WORD__SET_CURRENT = 'WORD__SET_CURRENT';
export const actionSetCurrentWordId = (wordId: string): AnyAction => ({
  type: WORD__SET_CURRENT, data: wordId,
});

/**
 * action: searching words starts with "keyword"
 */
export const WORD__SEARCH = 'WORD__SEARCH';
export const actionSearchWord = (
  keyword: string | Array<string>,
  offset = 0,
  limit = 30,
): AnyAction => {
  if (typeof keyword === 'string') {
    let filters = {};
    if (keyword && keyword.trim().length > 0) {
      filters = {
        word: keyword + '%'
      };
    }
    const data = {
      filters,
      limitation: new DbLimitation(offset, limit, 'word'),
    };
    return makeStart(WORD__SEARCH, data);
  } else {
    const filters = {word: {in: keyword}};
    const data = {
      filters,
      limitation: new DbLimitation(offset, limit),
    };
    return makeStart(WORD__SEARCH, data);
  }
};
const epicSearchWord = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${WORD__SEARCH}_START`),
  switchMap(({data}) => ajax.post(
    HOST.api.getUrl(HOST.api.word.search),
    data,
    headerJson,
  ).pipe(
    switchMap(({response}) => [makeDone(WORD__SEARCH, response.data)]),
    catchError((ajaxError: AjaxError) => [makeFailed(WORD__SEARCH, ajaxError)]),
  )),
);

/**
 * action: fetching word
 */
export const WORD__DETAIL_FETCH = 'WORD__DETAIL_FETCH';   // use to fetch data in word detail page, /word/:keyid_url
export const actionFetchWordStart = (keyidUrl: string): AnyAction => {
  const data = { filters: { [keyidUrl]: ['keyid', 'custom_url'] } };
  return makeStart(WORD__DETAIL_FETCH, data);
};
const epicFetchWord = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${WORD__DETAIL_FETCH}_START`),
  switchMap(({data}) => ajax.post(
    HOST.api.getUrl(HOST.api.word.search),
    data,
    headerJson).pipe(
    map(({response}) => makeDone(WORD__DETAIL_FETCH, response.data)),
    catchError((ajaxError: AjaxError) => [makeFailed(WORD__DETAIL_FETCH, ajaxError)])
  )),
);

/**
 * action: checking whether a word is existing or not
 */
export const WORD__CHECK_WORD_EXISTING = 'WORD__CHECK_WORD_EXISTING';
export const actionCheckWordExisting = (url: string) => makeStart(WORD__CHECK_WORD_EXISTING, { url });
const epicCheckWordExisting = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${WORD__CHECK_WORD_EXISTING}_START`),
  mergeMap(({data}) => {
    const apiUrl =  HOST.api.getUrl(HOST.api.word.is_existing) + data.url;
    return ajax.get(apiUrl).pipe(
      map(({response}) => makeDone(WORD__CHECK_WORD_EXISTING, response)),
      catchError((ajaxError: AjaxError) => [makeFailed(WORD__CHECK_WORD_EXISTING, ajaxError)]),
    );
  }),
);

/**
 * action: checking whether a word is existing or not based on its URL
 */
export const WORD__CHECK_URL_EXISTING = 'WORD__CHECK_URL_EXISTING';
export const actionCheckWordUrlExisting = (url: string) => makeStart(WORD__CHECK_URL_EXISTING, { url });
const epicCheckWordUrlExisting = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${WORD__CHECK_URL_EXISTING}_START`),
  mergeMap(({data}) => {
    const apiUrl =  HOST.api.getUrl(HOST.api.word.is_url_existing) + data.url;
    return ajax.get(apiUrl).pipe(
      map(({response}) => makeDone(WORD__CHECK_URL_EXISTING, response)),
      catchError((ajaxError: AjaxError) => [makeFailed(WORD__CHECK_URL_EXISTING, ajaxError)])
    );
  }),
);

/**
 * action: saving word
 */
export const WORD__SAVE = 'WORD__SAVE';
export const submitWord = (value: any) => makeStart(WORD__CHECK_URL_EXISTING, value);
const epicSaveWord = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${WORD__SAVE}_START`),
  mergeMap(({data}) => {
    return ajax.post(HOST.api.getUrl(HOST.api.word.save), data, headerAuth(readToken())).pipe(
      map(({response}) => makeDone(WORD__SAVE, response.data)),
      catchError((ajaxError: AjaxError) => [makeFailed(WORD__SAVE, ajaxError)])
    );
  }),
);

// ----- EPICs --------------------------------------------------------------------------------------------------------

export const epics = combineEpics(
  epicSearchWord,
  epicFetchWord,
  epicCheckWordExisting,
  epicCheckWordUrlExisting,
  epicSaveWord,
);

// ----- REDUCER ------------------------------------------------------------------------------------------------------
const initialState: WordState = {
  isWordExisting: true,
  isWordChecking: false,
  isUrlExisting: true,
  isUrlChecking: false,
  isSaving: false,
  isFetchingWord: false,
  isSearching: false,
  currentWordKeyid: '',
  words: [],
};
/**
 * Process only actions of WORD__
 */
const reducer: Reducer<WordState> = (state = initialState, action: AnyAction) => {
  // If this action is not belong to WORD, return the original state
  if (action.type.indexOf('WORD__') !== 0) {
    return state;
  }

  switch (action.type) {
    case `${WORD__SET_CURRENT}`:
      return {...state, currentWordKeyid: action.data};

    case `${WORD__SEARCH}_START`:
      return {...state, isSearching: true};
    case `${WORD__SEARCH}_DONE`:
      return {
        ...state,
        words: _.uniq(_.concat(state.words, action.data.models)),
        isSearching: false,
      };
    case `${WORD__SEARCH}_FAILED`:
      return {...state, isSearching: false};

    case `${WORD__CHECK_WORD_EXISTING}_START`:
      return {...state, isWordExisting: false, isWordChecking: true};
    case `${WORD__CHECK_WORD_EXISTING}_DONE`:
    case `${WORD__CHECK_WORD_EXISTING}_FAILED`:
      return {...state, isWordExisting: !!action.data, isWordChecking: false};

    case `${WORD__CHECK_URL_EXISTING}_START`:
      return {...state, isUrlExisting: false, isUrlChecking: true};
    case `${WORD__CHECK_URL_EXISTING}_DONE`:
    case `${WORD__CHECK_URL_EXISTING}_FAILED`:
      return {...state, isUrlExisting: !!action.data, isUrlChecking: false};

    case `${WORD__SAVE}_START`:
      return {...state, isSaving: true};
    case `${WORD__SAVE}_DONE`:
    case `${WORD__SAVE}_FAILED`:
      return {...state, isSaving: false};

    case `${WORD__DETAIL_FETCH}_START`:
      return {...state, isFetchingWord: true};
    case `${WORD__DETAIL_FETCH}_DONE`:
      return {
        ...state,
        words: _.uniq(_.concat(state.words, action.data.models[0])),
        isSearching: false,
      };
    case `${WORD__DETAIL_FETCH}_FAILED`:
      return {...state, isFetchingWord: false};

    default:
      return state;
  }
};
export default reducer;
