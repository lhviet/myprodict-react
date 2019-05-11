import React, { ReactNode } from 'react';
import { Action, Dispatch } from 'redux';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';
import styled from 'styled-components';
import {
  IMeaning,
  IMeaningUsage,
  IPronunciation,
  IWord,
} from 'myprodict-model/lib-esm';

import { styles } from '^/theme';
import { StoreState } from '^/types';

import Word from '^/1_components/atoms/Word';
import { actionSetCurrentWordId } from '^/3_store/ducks/word';

interface RootProps {
  isActive?: boolean;
}
const Root = styled.div<RootProps>`
  height: 100%;  
  overflow-y: auto;
  overscroll-behavior: contain;
  ${styles.scrollbar};
`;

const defaultLimit = 30;

interface Props {
  className?: string;

  words: IWord[];
  pronunciations: IPronunciation[];
  meanings: IMeaning[];
  usages: IMeaningUsage[];
  keyword?: string;
  exactWords?: Array<string>;
  currentWordId?: string;
  limit?: number;
  isEditable?: boolean;

  setCurrentWord(keyid: string): any;
}

function ListSearchWord({
  words, pronunciations, meanings, usages, keyword, exactWords,
  currentWordId, isEditable, setCurrentWord, limit, className,
}: Props) {
  const wordItems: ReactNode = words
    .filter(({ value }: IWord) => {
      if (keyword) {
        return _.toLower(value.word).startsWith(_.toLower(keyword));
      }
      return true;
    })
    .filter(({ value }: IWord) => {
      if (exactWords && exactWords.length > 0) {
        const requireWords = exactWords.map(_.toLower);
        return requireWords.includes(_.toLower(value.word));
      }
      return true;
    })
    .splice(0, limit || defaultLimit)
    .map((word: IWord) => {
      const predicate = {value: {word_keyid: word.keyid}};
      const meaningNumber = _.filter(meanings, predicate).length;
      const usageNumber = _.filter(usages, predicate).length;
      const pronItems = _.filter(pronunciations, predicate) as Array<IPronunciation>;
      const isActive = currentWordId ? currentWordId === word.keyid : false;
      return (
        <Word
          key={word.keyid}
          word={word}
          prons={pronItems}
          isActive={isActive}
          meaningNumber={meaningNumber}
          usageNumber={usageNumber}
          isEditable={isEditable}
          onSelectWord={setCurrentWord}
          link={`/word/${word.value.custom_url}`}
        />
      );
    });

  return (
    <Root className={className}>
      {wordItems}
    </Root>
  );
}

const mapStateToProps = ({ word, pron, meaning, meaningUsage }: StoreState) => {
  const currentWord: IWord | undefined = _.find(word.words, { keyid: word.currentWordKeyid });
  const currentWordId = currentWord ? currentWord.keyid : undefined;

  return {
    words: word.words,
    currentWordId,
    pronunciations: pron.items,
    meanings: meaning.items,
    usages: meaningUsage.items,
  };
};
const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  setCurrentWord(keyid: string) {
    dispatch(actionSetCurrentWordId(keyid));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ListSearchWord);
