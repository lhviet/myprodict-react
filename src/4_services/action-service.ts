import { AnyAction } from 'redux';

export const createActionStart = (type: string, data?: any): AnyAction => ({
  type: `${type}_START`,
  data
});
export const createActionDone = (type: string, data?: any): AnyAction => ({
  type: `${type}_DONE`,
  data
});
export const createActionFailed = (type: string, data?: any): AnyAction => ({
  type: `${type}_FAILED`,
  data
});