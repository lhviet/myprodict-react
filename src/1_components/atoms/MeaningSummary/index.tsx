import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { getEWordClassString, IMeaning, MPTypes } from 'myprodict-model/lib-esm';

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
  background-color: #fff;
`;
const Title = styled.div`
  padding: .6rem .5rem;
  font-size: .9rem;
  font-weight: 400;
  border-bottom: solid 1px ${colors.borderGray.alpha(.5).toString()};
`;
const BodyList = styled.ul`
  list-style: none;
  padding: .6rem .5rem;
  line-height: 1.2;
`;
const ListItem = styled.li`
  padding: .6rem .5rem;
  line-height: 1.2;
`;

interface Props {
  meanings: Array<IMeaning>;
}
export default ({ meanings }: Props) => {
  const listItems: ReactNode = meanings.map(meaning => {
    const wordClass: ReactNode = meaning.value.word_class && meaning.value.word_class !== MPTypes.WordClass.all ?
      (
        <span>
          {getEWordClassString(meaning.value.word_class)}
        </span>
      ) : undefined;

    return (
      <ListItem key={meaning.keyid}>
        {meaning.value.mean}
        {wordClass}
      </ListItem>
      );
  });

  return (
    <Root>
      <Title>Meaning</Title>
      <BodyList>
        {listItems}
      </BodyList>
    </Root>
  );
};
