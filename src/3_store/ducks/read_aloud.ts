import * as _ from 'lodash-es';
import { IReadAloud } from 'myprodict-model/lib-esm';
import { AnyAction, Reducer } from 'redux';
import { ActionsObservable, combineEpics, ofType } from 'redux-observable';
import { catchError, switchMap } from 'rxjs/operators';
import { ajax, AjaxError } from 'rxjs/ajax';

import { HOST } from '^/app-configs';
import { FetchStatus } from '^/types';

import { makeDone, makeFailed, makeStart } from '^/4_services/action-service';
import { headerJson } from '^/4_services/http-service';

export interface ReadAloudState {
  ras: Array<IReadAloud>;
  fetchStatus: FetchStatus;
}

/**
 * action: searching words starts with "keyword"
 */
export const READ_ALOUD__FETCH = 'READ_ALOUD__FETCH';
export function fetchReadAloud(order: number): AnyAction {
  return makeStart(READ_ALOUD__FETCH, order);
}
function epicFetchRA(action$: ActionsObservable<AnyAction>) {
  return action$.pipe(
    ofType(`${READ_ALOUD__FETCH}_START`),
    switchMap(({data: order}) => ajax.get(
      HOST.api.getUrl(HOST.api.read_aloud.fetch(order)),
      headerJson,
    ).pipe(
      switchMap(({response}) => [makeDone(READ_ALOUD__FETCH, response.data)]),
      catchError((ajaxError: AjaxError) => [makeFailed(READ_ALOUD__FETCH, ajaxError)]),
    )),
  );
}

// ----- EPICs --------------------------------------------------------------------------------------------------------

export const epics = combineEpics(
  epicFetchRA,
);

// ----- REDUCER ------------------------------------------------------------------------------------------------------
const initialState: ReadAloudState = {
  ras: [],
  fetchStatus: FetchStatus.IDLE,
};
/**
 * Process only actions of READ_ALOUD__
 */
const reducer: Reducer<ReadAloudState> = (state = initialState, action: AnyAction) => {
  // If this action is not belong to WORD, return the original state
  if (action.type.indexOf('READ_ALOUD__') !== 0) {
    return state;
  }

  switch (action.type) {
    case `${READ_ALOUD__FETCH}_START`:
      return {...state, fetchStatus: FetchStatus.FETCHING};
    case `${READ_ALOUD__FETCH}_DONE`:
      return {
        ...state,
        ras: _.uniq(_.concat(state.ras, action.data)),
        fetchStatus: FetchStatus.SUCCESS,
      };
    case `${READ_ALOUD__FETCH}_FAILED`:
      return {...state, fetchStatus: FetchStatus.FAIL};

    default:
      return state;
  }
};
export default reducer;
