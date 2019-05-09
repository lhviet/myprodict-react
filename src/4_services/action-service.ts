import { AnyAction } from 'redux';

export function createActionStart(type: string, data?: any): AnyAction {
  return {
    type: `${type}_START`,
      data
  };
}

export function createActionDone(type: string, data?: any): AnyAction {
  return {
    type: `${type}_DONE`,
      data
  };
}

export function createActionFailed(type: string, data?: any): AnyAction {
  return {
    type: `${type}_FAILED`,
      data
  };
}
