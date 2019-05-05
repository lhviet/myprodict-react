import React, { ReactNode } from 'react';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';
import { Action, Dispatch } from 'redux';
import styled from 'styled-components';
import { Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import {
  IPronunciation,
  isAdminOrSuperAdmin,
  IWord
} from 'myprodict-model/lib-esm';

import { IStoreState } from '^/types';

import PageLayout from '../_PageLayout';

import Word from '^/1_components/atoms/Word';
import MeaningSummary from '^/1_components/atoms/MeaningSummary';
import CardMeaning from '^/1_components/atoms/CardMeaning';
import CardExampleSentence from '^/1_components/atoms/CardExampleSentence';
import SearchInputField from '^/1_components/atoms/SearchInputField';
import { IWordState, actionSetCurrentWordId, actionSearchWordStart } from '^/3_store/ducks/word';
import { IPronState } from '^/3_store/ducks/pronunciation';
import { IMeaningState } from '^/3_store/ducks/meaning';
import { IUserState } from '^/3_store/ducks/user';
import { IMeaningUsageState } from '^/3_store/ducks/meaning_usage';
import { IMeaningExampleState, actionSearchExamples } from '^/3_store/ducks/meaning_usage_example';

import { colors, styles } from '^/theme';

const Root = styled.div`
  position: relative;
  height: calc(100vh - 3rem);
  overflow: hidden;
`;
const Left = styled.div`
  position: absolute;
  top: 0;
  width: 30%;
  height: 100%;
  background-color: white;
  border-right: solid 1px ${colors.borderGray.toString()};
`;
const LeftScrollWrapper = styled.div`
  height: calc(100% - 3rem);
  
  transition: all ease .1s;
  overflow-y: auto;
  overscroll-behavior: contain;
  ${styles.scrollbar}
`;
const Right = styled.div`
  margin-left: 30%;
  height: 100%;
  padding: 1rem;
  
  transition: all ease .1s;
  overflow-y: auto;
  overscroll-behavior: contain;
  ${styles.scrollbar}
`;

interface Props {
  word: IWordState;
  pron: IPronState;
  meaning: IMeaningState;
  user: IUserState;
  mUsage: IMeaningUsageState;
  mExample: IMeaningExampleState;

  setCurrentWord(keyid: string): any;
  searchWordExamples(term: string): any;
  searchWords(keyword: string, offset: number, limit: number): any;
}

interface State {
  wordItems: IWord[];
}

class PageHome extends React.Component<Props, State> {
  // create a Subject instance
  subjectSearch$: Subject<string> = new Subject();

  constructor(props: Props, context: any) {
    super(props, context);
    this.state = {
      wordItems: []
    };
  }

  componentDidMount() {
    this.setupWordItems(this.props.word);

    this.subjectSearch$.pipe(
      debounceTime(300),
      // distinctUntilChanged(),  // do not need to filter similar search term
      map((value: string) => this.props.searchWords(value, 0, 30)),
    ).subscribe();

    // init first search
    const {word} = this.props;
    if (!word.searchResult.models || word.searchResult.models.length === 0) {
      this.subjectSearch$.next('');
    }
  }

  componentWillUnmount() {
    if (!this.subjectSearch$.closed) {
      this.subjectSearch$.unsubscribe();
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    this.setupWordItems(nextProps.word);
  }

  setupWordItems = ({ searchResult }: IWordState) => {
    const words: IWord[] = searchResult.models || [];
    if (words.length > 0) {
      // check if new words fetched
      const wKeyids = words.map(w => w.keyid);
      const {wordItems} = this.state;
      const sKeyids = wordItems.map(w => w.keyid);
      const isNewWords = wKeyids.length !== sKeyids.length
        || !wKeyids.reduce((prev, k) => prev && sKeyids.indexOf(k) > -1, true);
      if (isNewWords) { // simply set wordItems if new words fetched in props
        this.setState({wordItems: words});
      }
    }
  }

  onSelectWord = (keyid: string, word: string) => {
    this.props.setCurrentWord(keyid);
    if (!_.find(this.props.mExample.termExamples, {term: word})) {
      this.props.searchWordExamples(word);
    }
  }

  onSearchChange = (keyword: string) => {
    this.subjectSearch$.next(keyword);
  }

  render() {
    const { word, pron, meaning, user, mUsage, mExample }: Props = this.props;
    const { wordItems }: State = this.state;

    const isWordEditable = user.auth_isLoggedIn && isAdminOrSuperAdmin(user.role);
    const currentWord = _.find(wordItems, {keyid: word.currentWordKeyid});

    let wordInfo: ReactNode;
    if (currentWord) {
      const meanings = _.filter(meaning.items, {value: {word_keyid: currentWord.keyid}});
      const usages = _.filter(mUsage.items, {value: {word_keyid: currentWord.keyid}});
      const termExample = _.find(mExample.termExamples, {term: currentWord.value.word});

      const wordMeaning: ReactNode = meanings.length > 0 ? (
        <MeaningSummary meanings={meanings} />
      ) : undefined;
      const wordExamples: ReactNode = termExample && termExample.examples.length > 0 ? (
        <CardExampleSentence
          word={currentWord.value.word}
          wordCustomUrl={currentWord.value.custom_url}
          examples={termExample.examples.slice(0, 3)}
        />
      ) : undefined;

      // (Usages & Examples) of Word which has no Meaning
      const usagesOfMean = usages.filter(({ value }) => value.meaning_keyid === null);
      const usagesOfWordNoMeaning: ReactNode = usagesOfMean.length > 0 ? (
        <CardMeaning usages={usagesOfMean} examples={mExample.items}/>
      ) : undefined;

      // (Usages & Examples) of Meanings (of Word)
      const wordMeanings: ReactNode = meanings.length > 0 ?
        meanings.map(m => (
          <CardMeaning
            key={m.keyid}
            meaning={m.value.mean}
            usages={_.filter(usages, {value: {meaning_keyid: m.keyid}})}
            examples={mExample.items}
          />
        )) : undefined;

      wordInfo = (
        <>
          {wordMeaning}
          {wordExamples}
          {usagesOfWordNoMeaning}
          {wordMeanings}
        </>
      );
    }

    const words: ReactNode = wordItems.map((model: IWord) => {
      const predicate = {value: {word_keyid: model.keyid}};
      const meaningNumber = _.filter(meaning.items, predicate).length;
      const usageNumber = _.filter(mUsage.items, predicate).length;
      const pronItems = _.filter(pron.items, predicate) as Array<IPronunciation>;
      const isActive = currentWord && currentWord.keyid === model.keyid;

      return (
        <Word
          key={model.keyid}
          word={model}
          prons={pronItems}
          isActive={isActive}
          meaningNumber={meaningNumber}
          usageNumber={usageNumber}
          isEditable={isWordEditable}
          onSelectWord={this.onSelectWord}
          link={`/word/${model.value.custom_url}`}
        />
      );
    });

    return (
      <PageLayout>
        <Root>
          <Left>
            <SearchInputField
              isSearching={word.isSearching}
              onChange={this.onSearchChange}
            />
            <LeftScrollWrapper>
              {words}
            </LeftScrollWrapper>
          </Left>
          <Right>
            {wordInfo}
          </Right>
        </Root>
      </PageLayout>
    );
  }
}

const mapStateToProps = (state: IStoreState) => ({
  word: state.word,
  pron: state.pron,
  meaning: state.meaning,
  user: state.user,
  mUsage: state.meaning_usage,
  mExample: state.meaning_usage_example,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  setCurrentWord(wordKeyid: string) {dispatch(actionSetCurrentWordId(wordKeyid)); },
  searchWordExamples(term: string) {dispatch(actionSearchExamples(term)); },
  searchWords(keyword: string, offset: number, limit: number) {
    dispatch(actionSearchWordStart(keyword, offset, limit));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(PageHome);
