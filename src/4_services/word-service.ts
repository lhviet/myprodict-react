import * as Diff from 'diff';
import * as _ from 'lodash-es';

export function getAlphanumericWords(word: string): Array<string> {
  return word.match(/[\w-]+/ig) || [];
}
export function  getMissingWords(diffWords: Array<Diff.Change>): Array<string> {
  return _.uniq(
    diffWords
      .filter(word => word.removed)
      .map(word => getAlphanumericWords(word.value).join(','))
      .join(',')
      .split(',')
  );
}
export function countWord(phrase: string): number {
  const matches = phrase.match(/\S+/ig);
  return matches ? matches.length : 0;
}
export function getWords(phrase: string): Array<string> {
  const matches = phrase.match(/[\w]+/ig);
  return matches ? matches : [];
}