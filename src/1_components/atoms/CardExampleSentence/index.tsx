import React, { ReactNode, useState } from 'react';
import styled from 'styled-components';
import { alpha, colors } from '^/theme';

import ButtonExpand from '^/1_components/atoms/ButtonExpand';

const Root = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 4.5rem;
  word-wrap: break-word;
  border: 1px solid ${colors.borderGray.alpha(alpha.alpha5).toString()};
  border-radius: 3px;
  background-clip: border-box;
  background-color: #fff;
`;
const Title = styled.div`
  padding: .6rem .5rem;
  font-size: .9rem;
  font-weight: 400;
  border-bottom: solid 1px ${colors.borderGray.alpha(alpha.alpha5).toString()};
`;
const ExampleList = styled.ul`
  list-style: none;
  line-height: 1.2;
  padding: 0 .5rem;
  margin-bottom: 0.4rem;
`;
const ListItem = styled.li`
  padding: .6rem .5rem;
  line-height: 1.2;
`;
const ListItemOrder = styled.span`
  padding-right: .5rem;
  font-size: .8rem;
  color: ${colors.grey.toString()};
`;
const HighlightWord = styled.span`
  margin-right: .3rem;
  background-color: ${colors.yellow.alpha(alpha.alpha3).toString()};
`;
const ButtonExpandWrapper = styled.div`
  text-align: center;
`;

const exampleNumber = 3;
const highlightWord: (str: string, word: string) => React.ReactNode = (str, word) => {
  const reg = new RegExp(word, 'ig');

  return str.split(' ')
    .map((w, index) =>
      w.match(reg) ? (
        <HighlightWord key={index}>
          {w}
        </HighlightWord>
      ) : `${w} `
    );
};

interface Props {
  word: string;
  examples: string[];
  className?: string;
}
export default ({ word, examples, className }: Props) => {
  const [isExpanded, setExpanded] = useState(false);

  const expandCollapse = () => setExpanded(!isExpanded);

  const shortExamples = !isExpanded && examples.length > exampleNumber ?
    examples.slice(0, exampleNumber) : examples;
  const shortExampleItems: ReactNode = shortExamples
    .map((ex, index) => (
      <ListItem key={index}>
        <ListItemOrder>{index + 1}.</ListItemOrder>
        {highlightWord(ex, word)}
      </ListItem>
    ));

  const expandButton: ReactNode = examples.length > exampleNumber ? (
    <ButtonExpandWrapper>
      <ButtonExpand
        labels={['Less', 'More']}
        fontIcons={['fa-chevron-up', 'fa-chevron-down']}
        isExpanded={isExpanded}
        onClick={expandCollapse}
      />
    </ButtonExpandWrapper>
  ) : undefined;

  return (
    <Root className={className}>
      <Title>Examples - {examples.length}</Title>
      <ExampleList>
        {shortExampleItems}
      </ExampleList>
      {expandButton}
    </Root>
  );
};
