import { AnyAction, Reducer } from 'redux';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { ajax, AjaxError } from 'rxjs/ajax';
import { ActionsObservable, combineEpics, ofType } from 'redux-observable';
import { MPTypes } from 'myprodict-model/lib-esm';

import { HOST } from '^/app-configs';

import { makeDone, makeFailed, makeStart } from '^/4_services/action-service';
import { headerAuth } from '^/4_services/http-service';
import { readToken, removeToken, storeToken } from '^/4_services/local-storage-service';

export interface UserState {
  // auth
  auth_isLoggedIn: boolean;
  // user
  keyid: string;
  username: string;
  email: string;
  displayname: string;
  avatar_url: string;
  cover_url: string;
  home_url: string;
  gender: string;
  language: string;
  country: string;
  role: MPTypes.UserRole;
}

// ----- ACTIONS & EPICS ----------------------------------------------------------------------------------------------

// set Logged-in with token stored in LocalStorage
export const USER__AUTH_SET_LOGGED_IN = 'USER__AUTH_SET_LOGGED_IN';
export const actionSetLoggedIn = (token: string): AnyAction => ({ type: USER__AUTH_SET_LOGGED_IN, data: token });
const epicSetLoggedIn = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(USER__AUTH_SET_LOGGED_IN),
  map(({data}) => {
    storeToken(data);
    return actionFetchUserInfo();
  })
);

export const USER__AUTH_SET_LOGGED_OUT = 'USER__AUTH_SET_LOGGED_OUT';
export const actionLoggedOut = () => makeStart(USER__AUTH_SET_LOGGED_OUT);
const epicLogout = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${USER__AUTH_SET_LOGGED_OUT}_START`),
  mergeMap(() => {
    return ajax.post(HOST.api.getUrl(HOST.api.user.logout)).pipe(
      map(({response}) => makeDone(USER__AUTH_SET_LOGGED_OUT, response.data)),
      catchError((ajaxError: AjaxError) => [makeFailed(USER__AUTH_SET_LOGGED_OUT, ajaxError)])
    );
  }),
);

export const USER__FETCH_INFO = 'USER__FETCH_INFO';
export const actionFetchUserInfo = () => makeStart(USER__FETCH_INFO);
const fetchUserData1 = () => ajax.get(
  HOST.api.getUrl(HOST.api.user.loadUser),
  headerAuth(readToken()),
);
const fetchUserData2 = () => ajax.get(HOST.api.getUrl(HOST.api.user.loadUserBasic),
                                      headerAuth(readToken()));
const epicFetchUserInfo1 = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${USER__FETCH_INFO}_START`),
  switchMap(() => {
    return fetchUserData1().pipe(
      map(({response}) => makeDone(USER__FETCH_INFO, response.data)),
      catchError((ajaxError: AjaxError) => [makeFailed(USER__FETCH_INFO, ajaxError)])
    );
  }),
);
const epicFetchUserInfo2 = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${USER__FETCH_INFO}_START`),
  switchMap(() => {
    return fetchUserData2().pipe(
      map(({response}) => makeDone(USER__FETCH_INFO, response.data)),
      catchError((ajaxError: AjaxError) => [makeFailed(USER__FETCH_INFO, ajaxError)])
    );
  }),
);

// ----- EPICs --------------------------------------------------------------------------------------------------------

export const epics = combineEpics(
  epicSetLoggedIn,
  epicLogout,
  epicFetchUserInfo1,
  epicFetchUserInfo2,
);

// ----- REDUCER ------------------------------------------------------------------------------------------------------
const initialState: UserState = {
  auth_isLoggedIn: false,
  keyid: '',
  username: '',
  email: '',
  displayname: '',
  avatar_url: '',
  cover_url: '',
  home_url: '',
  gender: '',
  language: '',
  country: '',
  role: MPTypes.UserRole.User,
};
/**
 * Process only actions of WORD__
 * @param {UserState} state
 * @param action
 * @returns {UserState}
 */
const reducer: Reducer<UserState> = (state = initialState, action: any) => {

  // if this action is not belong to WORD, return the original state
  if (action.type.indexOf('USER__') !== 0) {
    return state;
  }

  switch (action.type) {
    case `${USER__AUTH_SET_LOGGED_IN}`:
      return {...state, auth_isLoggedIn: true};

    // async actions

    case `${USER__AUTH_SET_LOGGED_OUT}_DONE`:
      removeToken();
      return {...state, auth_isLoggedIn: false};

    case `${USER__FETCH_INFO}_DONE`:
      return {
        ...state,
        ...action.data.value,
      };
    case `${USER__FETCH_INFO}_FAILED`:
      // remove auth_token
      removeToken();
      return { ...state, auth_isLoggedIn: false};
    default:
      return state;
  }
};
export default reducer;
