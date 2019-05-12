export function isAlphanumericWord(word: string): boolean {
  const matches = word.match(/[\w-]+/ig);
  return !!matches && matches.length === 1;
}
export function countWord(phrase: string): number {
  const matches = phrase.match(/\S+/ig);
  return matches ? matches.length : 0;
}
export function getWords(phrase: string): Array<string> {
  const matches = phrase.match(/[\w]+/ig);
  return matches ? matches : [];
}