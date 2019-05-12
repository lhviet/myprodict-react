// tslint:disable
import { round } from 'lodash-es';

export function getPercentage(divident: number, divisor: number, radix: number = 0): number {
  const quotient = 100 * divident / divisor;
  return round(quotient, radix);
}