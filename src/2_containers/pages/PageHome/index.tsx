import React, { ReactNode } from 'react';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';
import { Action, Dispatch } from 'redux';
import styled from 'styled-components';
import { Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import {
  isAdminOrSuperAdmin,
  IWord
} from 'myprodict-model/lib-esm';

import { StoreState } from '^/types';

import PageLayout from '../_PageLayout';

import MeaningSummary from '^/1_components/atoms/MeaningSummary';
import CardMeaning from '^/1_components/atoms/CardMeaning';
import CardExampleSentence from '^/1_components/atoms/CardExampleSentence';
import SearchInputField from '^/1_components/atoms/SearchInputField';
import ListSearchWord from '^/2_containers/components/ListSearchWord';
import { WordState, actionSetCurrentWordId, actionSearchWord } from '^/3_store/ducks/word';
import { PronState } from '^/3_store/ducks/pronunciation';
import { MeaningState } from '^/3_store/ducks/meaning';
import { UserState } from '^/3_store/ducks/user';
import { MeaningUsageState } from '^/3_store/ducks/meaning_usage';
import { MeaningExampleState, actionSearchExamples } from '^/3_store/ducks/meaning_usage_example';

import { colors, styles } from '^/theme';

const Root = styled.div`
  position: relative;
  height: calc(100vh - 3rem);
  overflow: hidden;
`;
const Left = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 30%;
  max-width: 300px;
  background-color: #fff;
  border-right: solid 1px ${colors.borderGray.toString()};
`;
const ListWord = styled(ListSearchWord)`
  height: calc(100% - 3rem);
`;
const Right = styled.div`
  margin-left: 30%;
  height: 100%;
  padding: 1rem;
  
  overflow-y: auto;
  overscroll-behavior: contain;
  ${styles.scrollbar};
`;

const searchDebouncePeriod = 300; // milliseconds
const limitWordToSearch = 30; // milliseconds
const sampleSentenceNumber = 5; // milliseconds

interface Props {
  word: WordState;
  pron: PronState;
  meaning: MeaningState;
  user: UserState;
  mUsage: MeaningUsageState;
  mExample: MeaningExampleState;

  setCurrentWord(keyid: string): any;
  searchWords(keyword: string, offset: number, limit: number): any;
}
interface State {
  keyword: string;
  wordItems: IWord[];
}
class PageHome extends React.Component<Props, State> {
  // create a Subject instance
  subjectSearch$: Subject<string> = new Subject();

  constructor(props: Props, context: any) {
    super(props, context);
    this.state = {
      keyword: '',
      wordItems: [],
    };
  }

  componentDidMount() {
    this.setupWordItems(this.props.word);

    this.subjectSearch$.pipe(
      debounceTime(searchDebouncePeriod),
      map((keyword: string) => this.props.searchWords(keyword, 0, limitWordToSearch)),
    ).subscribe();

    // init first search
    const {word} = this.props;
    if (word.words.length === 0) {
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

  setupWordItems = ({ words }: WordState) => {
    if (words.length > 0) {
      // check if new words fetched
      const wKeyids = words.map(w => w.keyid);
      const { wordItems } = this.state;
      const sKeyids = wordItems.map(w => w.keyid);
      const isNewWords = wKeyids.length !== sKeyids.length
        || !wKeyids.reduce((prev, k) => prev && sKeyids.indexOf(k) > -1, true);
      if (isNewWords) { // simply set wordItems if new words fetched in props
        this.setState({wordItems: words});
      }
    }
  }

  onSearchChange = (keyword: string) => {
    this.subjectSearch$.next(keyword);
    this.setState({ keyword });
  }

  render() {
    const { word, meaning, user, mUsage, mExample }: Props = this.props;
    const { keyword, wordItems }: State = this.state;

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
          examples={termExample.examples.slice(0, sampleSentenceNumber)}
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

    return (
      <PageLayout>
        <Root>
          <Left>
            <SearchInputField
              isSearching={word.isSearching}
              onChange={this.onSearchChange}
            />
            <ListWord keyword={keyword} isEditable={isWordEditable} />
          </Left>
          <Right>
            {wordInfo}
          </Right>
        </Root>
      </PageLayout>
    );
  }
}

const mapStateToProps = (state: StoreState) => ({
  word: state.word,
  pron: state.pron,
  meaning: state.meaning,
  user: state.user,
  mUsage: state.meaningUsage,
  mExample: state.meaningExample,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  setCurrentWord(wordKeyid: string) {dispatch(actionSetCurrentWordId(wordKeyid)); },
  searchWords(keyword: string, offset: number, limit: number) {
    dispatch(actionSearchWord(keyword, offset, limit));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(PageHome);
