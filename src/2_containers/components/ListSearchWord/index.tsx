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
import { IStoreState } from '^/types';

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

interface Props {
  words: IWord[];
  pronunciations: IPronunciation[];
  meanings: IMeaning[];
  usages: IMeaningUsage[];
  currentWordId?: string;
  className?: string;
  isEditable?: boolean;
  setCurrentWord(keyid: string): any;
}

interface State {
}

class ListSearchWord extends React.Component<Props, State> {
  constructor(props: Props, context: any) {
    super(props, context);
    this.state = {
    };
  }

  render() {
    const { words, pronunciations, meanings, usages, currentWordId, isEditable, setCurrentWord }: Props = this.props;

    const wordItems: ReactNode = words.map((word: IWord) => {
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
      <Root className={this.props.className}>
        {wordItems}
      </Root>
    );
  }
}

const mapStateToProps = ({ word, pron, meaning, meaning_usage }: IStoreState) => {
  const words: IWord[] = word.searchResult.models || [];
  const currentWord: IWord | undefined = _.find(words, { keyid: word.currentWordKeyid });
  const currentWordId = currentWord ? currentWord.keyid : undefined;

  return {
    words,
    currentWordId,
    pronunciations: pron.items,
    meanings: meaning.items,
    usages: meaning_usage.items,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  setCurrentWord(wordKeyid: string) {
    dispatch(actionSetCurrentWordId(wordKeyid));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ListSearchWord);
