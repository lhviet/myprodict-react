export function isAlphanumericWord(word: string): boolean {
  const matches = word.match(/[\w-]+/ig);
  return !!matches && matches.length === 1;
}