import * as React from 'react';
import { connect } from 'react-redux';
import { debounceTime, map } from 'rxjs/operators';
import { Subject } from 'rxjs/internal/Subject';
import { Action, Dispatch } from 'redux';
import styled from 'styled-components';

import { IStoreState } from '^/types';
import { zIndex } from '^/theme';

import NavBarTop from '^/1_components/molecules/NavBarTop';
import { IUserState, actionSetLoggedIn } from '^/3_store/ducks/user';
import { IWordState } from '^/3_store/ducks/word';
import { readToken } from '^/4_services/local-storage-service';

const Root = styled.div`
  width: 100%;
  margin: 0 auto;
`;

const NavBar = styled(NavBarTop)`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: ${zIndex.topbarNav};
`;
const Body = styled.div`
  margin-top: 3rem;
`;

interface Props {
  isResultListDisplay?: boolean; // enable result list to display or not
  user: IUserState;
  word: IWordState;
  setLoggedIn(token: string): any;
}

class PageLayout extends React.Component<Props> {
  componentDidMount() {
    const token = readToken();
    if (this.props.setLoggedIn && !!token && token.trim().length > 0) {
      this.props.setLoggedIn(token);
    }
  }

  render() {
    return (
      <Root>
        <NavBar
          isLoggedIn={this.props.user.auth_isLoggedIn}
          userRole={this.props.user.role}
        />
        <Body>
          {this.props.children}
        </Body>
      </Root>
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
});

export default connect(mapStateToProps, mapDispatchToProps)(PageLayout);
