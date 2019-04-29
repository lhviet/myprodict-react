import { DbLimitation, IWord } from 'myprodict-model/lib-esm';
import { AnyAction } from 'redux';
import { ActionsObservable, combineEpics, ofType } from 'redux-observable';
import { concat, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, take, mapTo } from 'rxjs/operators';
import { ajax, AjaxError } from 'rxjs/ajax';

import { HOST } from '^/app-configs';

import {
  createActionDone,
  createActionFailed,
  createActionStart,
} from '^/4_services/action-service';
import { headerAuth, headerJson } from '^/4_services/http-service';
import { readToken } from '^/4_services/local-storage-service';

export interface IWordState {
  isWordExisting: boolean;
  isWordChecking: boolean;
  isUrlExisting: boolean;
  isUrlChecking: boolean;
  isSaving: boolean;
  isFetchingWord: boolean;
  isSearching: boolean;
  currentWordKeyid: string;
  wordItem?: IWord;  // store fetching data of word in WORD__DETAIL_FETCH
  searchResult: {
    models?: IWord[],
    total?: number
  };
}

export const WORD_STATE_INIT: IWordState = {
  isWordExisting: true,
  isWordChecking: false,
  isUrlExisting: true,
  isUrlChecking: false,
  isSaving: false,
  isFetchingWord: false,
  isSearching: false,
  currentWordKeyid: '',
  searchResult: {},
};

// ----- ACTIONS & EPICS ----------------------------------------------------------------------------------------------

export const WORD__SET_CURRENT = 'WORD__SET_CURRENT';
export const actionSetCurrentWordId = (wordId: string): AnyAction => ({ type: WORD__SET_CURRENT, data: wordId });

/**
 * action: searching words
 */
export const WORD__SEARCH = 'WORD__SEARCH';
export const actionSearchWordStart = (keyword: string, offset: number, limit: number): AnyAction => {
  const filters = {word: ''};
  if (keyword && keyword.trim().length > 0) {
    filters.word = keyword + '%';
  }
  const data = {
    filters,
    limitation: new DbLimitation(offset, limit, keyword ? 'word' : ''),
  };
  return createActionStart(WORD__SEARCH, data);
};
const epicSearchWord = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${WORD__SEARCH}_START`),
  switchMap(({data}) => ajax.post(
    HOST.api.getUrl(HOST.api.word.search),
    data,
    headerJson).pipe(
    switchMap(({response}) => of(createActionDone(WORD__SEARCH, response.data))),
    catchError((ajaxError: AjaxError) => of(createActionFailed(WORD__SEARCH, ajaxError)))
  )),
);

/**
 * action: fetching word
 */
export const WORD__DETAIL_FETCH = 'WORD__DETAIL_FETCH';   // use to fetch data in word detail page, /word/:keyid_url
export const actionFetchWordStart = (keyidUrl: string): AnyAction => {
  const data = { filters: { [keyidUrl]: ['keyid', 'custom_url'] } };
  return createActionStart(WORD__DETAIL_FETCH, data);
};
const epicFetchWord = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${WORD__DETAIL_FETCH}_START`),
  switchMap(({data}) => ajax.post(
    HOST.api.getUrl(HOST.api.word.search),
    data,
    headerJson).pipe(
    map(({response}) => createActionDone(WORD__DETAIL_FETCH, response.data)),
    catchError((ajaxError: AjaxError) => of(createActionFailed(WORD__DETAIL_FETCH, ajaxError)))
  )),
);

/**
 * action: fetching word
 */
export const WORD__OXFORD_FETCH = 'WORD__OXFORD_FETCH';   // use to fetch data in word detail page, /word/:keyid_url
export const actionFetchWordOxfordStart = (word: string): AnyAction => {
  return createActionStart(WORD__OXFORD_FETCH, { word });
};
const epicFetchWordOxford = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${WORD__OXFORD_FETCH}_START`),
  mergeMap(({data}) =>
    ajax.get(HOST.api.getUrl(HOST.api.oxford + data.word)).pipe(
      mergeMap(() => {
        return concat(
          [actionFetchWordStart(data.word)],
          action$.pipe(
            ofType(`${WORD__OXFORD_FETCH}_DONE`),
            take(1),
            mapTo(actionFetchWordStart(data.word)),
          ),
        );
      }),
      catchError((ajaxError: AjaxError) => [createActionFailed(WORD__OXFORD_FETCH, ajaxError)])
    ),
  ),
);

/**
 * action: checking whether a word is existing or not
 */
export const WORD__CHECK_WORD_EXISTING = 'WORD__CHECK_WORD_EXISTING';
export const actionCheckWordExisting = (url: string) => createActionStart(WORD__CHECK_WORD_EXISTING, { url });
const epicCheckWordExisting = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${WORD__CHECK_WORD_EXISTING}_START`),
  mergeMap(({data}) => {
    const apiUrl =  HOST.api.getUrl(HOST.api.word.is_existing) + data.url;
    return ajax.get(apiUrl).pipe(
      map(({response}) => createActionDone(WORD__CHECK_WORD_EXISTING, response)),
      catchError((ajaxError: AjaxError) => of(createActionFailed(WORD__CHECK_WORD_EXISTING, ajaxError))),
    );
  }),
);

/**
 * action: checking whether a word is existing or not based on its URL
 */
export const WORD__CHECK_URL_EXISTING = 'WORD__CHECK_URL_EXISTING';
export const actionCheckWordUrlExisting = (url: string) => createActionStart(WORD__CHECK_URL_EXISTING, { url });
const epicCheckWordUrlExisting = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${WORD__CHECK_URL_EXISTING}_START`),
  mergeMap(({data}) => {
    const apiUrl =  HOST.api.getUrl(HOST.api.word.is_url_existing) + data.url;
    return ajax.get(apiUrl).pipe(
      map(({response}) => createActionDone(WORD__CHECK_URL_EXISTING, response)),
      catchError((ajaxError: AjaxError) => of(createActionFailed(WORD__CHECK_URL_EXISTING, ajaxError)))
    );
  }),
);

/**
 * action: saving word
 */
export const WORD__SAVE = 'WORD__SAVE';
export const submitWord = (value: any) => createActionStart(WORD__CHECK_URL_EXISTING, value);
const epicSaveWord = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${WORD__SAVE}_START`),
  mergeMap(({data}) => {
    return ajax.post(HOST.api.getUrl(HOST.api.word.save), data, headerAuth(readToken())).pipe(
      map(({response}) => createActionDone(WORD__SAVE, response.data)),
      catchError((ajaxError: AjaxError) => of(createActionFailed(WORD__SAVE, ajaxError)))
    );
  }),
);

// ----- EPICs --------------------------------------------------------------------------------------------------------

export const epics = combineEpics(
  epicSearchWord,
  epicFetchWord,
  epicFetchWordOxford,
  epicCheckWordExisting,
  epicCheckWordUrlExisting,
  epicSaveWord,
);

// ----- REDUCER ------------------------------------------------------------------------------------------------------

/**
 * Process only actions of WORD__
 * @param {IWordState} state
 * @param action
 * @returns {IWordState}
 */
export default (state = WORD_STATE_INIT, action: any): IWordState => {

  // console.log('action = ', action);

  // if this action is not belong to WORD, return the original state
  if (action.type.indexOf('WORD__') !== 0) {
    return state;
  }

  switch (action.type) {
    case `${WORD__SET_CURRENT}`:
      return {...state, currentWordKeyid: action.data};

    case `${WORD__SEARCH}_START`:
      return {...state, isSearching: true};
    case `${WORD__SEARCH}_DONE`:
      return {...state, searchResult: action.data, isSearching: false};
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
      const word = action.data.models[0];
      return {...state, wordItem: word, isFetchingWord: false};
    case `${WORD__DETAIL_FETCH}_FAILED`:
      return {...state, isFetchingWord: false};

    case `${WORD__OXFORD_FETCH}_START`:
      return {...state, isFetchingWord: true};
    case `${WORD__OXFORD_FETCH}_DONE`:
      return {...state, isFetchingWord: false};
    case `${WORD__OXFORD_FETCH}_FAILED`:
      return {...state, isFetchingWord: false};
    default:
      return state;
  }
};
