import * as React from 'react';
import { connect } from 'react-redux';
import { debounceTime, map } from 'rxjs/operators';
import { Subject } from 'rxjs/internal/Subject';
import { Action, Dispatch } from 'redux';

import { IStoreState } from '^/types';

import NavBarTop from '^/1_components/molecules/NavBarTop';
import { IUserState, actionSetLoggedIn } from '^/3_store/ducks/user';
import { IWordState, actionSearchWordStart } from '^/3_store/ducks/word';
import { readToken } from '^/4_services/local-storage-service';

import styles from './styles.module.scss';

interface PageLayoutProps {
  isResultListDisplay?: boolean; // enable result list to display or not
  user: IUserState;
  word: IWordState;
  setLoggedIn(token: string): any;
  actionSearchWordStart(keyword: string, offset: number, limit: number): any;
}

class PageLayout extends React.Component<PageLayoutProps> {

// create a Subject instance
  subjectSearch$: Subject<string> = new Subject();

  componentDidMount() {
    const token = readToken();
    if (this.props.setLoggedIn && !!token && token.trim().length > 0) {
      this.props.setLoggedIn(token);
    }

    this.subjectSearch$.pipe(
      debounceTime(300),
      // distinctUntilChanged(),  // do not need to filter similar search term
      map((value: string) => this.props.actionSearchWordStart(value, 0, 30)),
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

  onSearchChange = (keyword: string) => {
    this.subjectSearch$.next(keyword);
  }

  render() {
    const {children, user, word, isResultListDisplay} = this.props;
    return (
      <div className={styles.pageLayout}>
        <NavBarTop
          isResultListDisplay={isResultListDisplay || true}
          isSearching={word.isSearching}
          searchResult={word.searchResult}
          isLoggedIn={user.auth_isLoggedIn}
          userRole={user.role}
          onSearchChange={this.onSearchChange}
        />
        {children}
      </div>
    );
  }
}

const mapStateToProps = (state: IStoreState) => ({
  user: state.user,
  word: state.word,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  setLoggedIn(token: string) {
    dispatch(actionSetLoggedIn(token));
  },
  actionSearchWordStart(keyword: string, offset: number, limit: number) {
    dispatch(actionSearchWordStart(keyword, offset, limit));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(PageLayout);
