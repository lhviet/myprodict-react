import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { colors } from '^/theme';

const Root = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 4.5rem;
  word-wrap: break-word;
  border: 1px solid ${colors.borderGray.alpha(.5).toString()};
  border-radius: 3px;
  background-clip: border-box;
  background-color: white;
`;
const Title = styled.div`
  padding: .6rem .5rem;
  font-size: .9rem;
  font-weight: 400;
  border-bottom: solid 1px ${colors.borderGray.alpha(.5).toString()};
`;

interface Props {
  word: string;
  examples: string[];
  wordCustomUrl?: string;
}
export default ({ word, examples, wordCustomUrl }: Props) => {
  const reg = new RegExp(word, 'g');

  return (
    <Root>
      <Title>{'example in sentences'}</Title>
      <ul className={'list-group'}>
        {examples.slice(0, 3)
          .map((ex, index) => <li
            key={index}
            className={'list-group-item'}
            dangerouslySetInnerHTML={
              {__html: ex.replace(reg, `<span class="highlight-word">${word}</span>`)}}
          />)}
      </ul>
      {wordCustomUrl &&
      <Link
        to={`/word/${wordCustomUrl}`}
        className={'pos-a b-0 r-d5 p-1 font-weight-700'}
        style={{zIndex: 100}}
      >
        {'...'}
      </Link>}
    </Root>
  );
}
