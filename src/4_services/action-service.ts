import { AnyAction } from 'redux';

export function makeStart(type: string, data?: any): AnyAction {
  return {
    data,
    type: `${type}_START`,
  };
}
export function makeDone(type: string, data?: any): AnyAction {
  return {
    data,
    type: `${type}_DONE`,
  };
}
export function makeFailed(type: string, data?: any): AnyAction {
  return {
    data,
    type: `${type}_FAILED`,
  };
}
