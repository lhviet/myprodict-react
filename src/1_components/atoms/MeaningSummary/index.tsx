import React, {ReactNode, useState} from 'react';
import styled from 'styled-components';
import {
  getEWordClassString, IMeaning, IMeaningExample, IMeaningUsage, MPTypes,
} from 'myprodict-model/lib-esm';

import {alpha, colors} from '^/theme';
import * as _ from 'lodash-es';

import CardMeaningRaw from '^/1_components/atoms/CardMeaning';
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
const Head = styled.div`
  display: flex;
  justify-content: space-between;
  padding: .6rem .5rem;
  font-size: .9rem;
  font-weight: 400;
  border-bottom: solid 1px ${colors.borderGray.alpha(alpha.alpha5).toString()};
`;
const BodyList = styled.ul`
  list-style: none;
  padding: 0;
`;
const ListItemOrder = styled.span`
  padding-right: .3rem;
  font-size: .9rem;
  color: ${colors.grey.toString()};
`;
const ListItem = styled.li`
  padding: 0 .5rem;
`;
const WordDetail = styled.div`
  margin-bottom: .5rem;
`;
const WordClass = styled.span`
  margin-left: .5rem;
  font-size: .9rem;
  font-weight: 500;
  font-style: italic;
  display: inline-block;
  color: ${colors.grey.alpha(alpha.alpha9).toString()};
`;
const MeaningTitle = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${colors.blue.alpha(alpha.alpha9).toString()};
`;
const CardMeaning = styled(CardMeaningRaw)`
  margin: .5rem 0;
`;
const ButtonExpandItem = styled(ButtonExpand)`
  float: right;
`;

interface Props {
  meanings: Array<IMeaning>;
  usages: Array<IMeaningUsage>;
  examples: Array<IMeaningExample>;
  className?: string;
}
export default ({ meanings, usages, examples, className }: Props) => {
  const [expandedItems, setExpandedItems] = useState<Array<number>>([]);

  const isExpandedAll = expandedItems.length === meanings.length;

  const listItems: ReactNode = meanings.map((meaning, index) => {
    const order: number = index + 1;
    const isExpanded = expandedItems.includes(index);
    const onExpandCollapse = () => {
      const expandeds = isExpanded ?
        _.without(expandedItems, index) :
        _.concat(expandedItems, index);
      setExpandedItems(expandeds);
    };

    const wordClass: ReactNode =
      meaning.value.word_class && meaning.value.word_class !== MPTypes.WordClass.all ? (
        <WordClass>
          {getEWordClassString(meaning.value.word_class)}
        </WordClass>
      ) : undefined;

    const meaningDetail: ReactNode = expandedItems.includes(index) ? (
      <CardMeaning
        usages={_.filter(usages, {value: {meaning_keyid: meaning.keyid}})}
        examples={examples}
      />
    ) : undefined;

    return (
      <ListItem key={meaning.keyid}>
        <WordDetail>
          <ListItemOrder>
            {order}.
          </ListItemOrder>
          <MeaningTitle>
            {meaning.value.mean}
          </MeaningTitle>
          {wordClass}
          <ButtonExpandItem
            labels={['', '']}
            fontIcons={['fa-minus-square-o', 'fa-plus-square-o']}
            isExpanded={isExpanded}
            onClick={onExpandCollapse}
          />
        </WordDetail>
        {meaningDetail}
      </ListItem>
      );
  });

  const onExpandCollapseAll = () => {
    if (expandedItems.length === meanings.length) {
      setExpandedItems([]);
    } else {
      setExpandedItems(meanings.map((m, index) => index));
    }
  };

  return (
    <Root className={className}>
      <Head>
        <div>
          Meaning - {meanings.length}
        </div>
        <ButtonExpand
          labels={['Collapse all', 'Expand all']}
          fontIcons={['fa-minus-square-o', 'fa-plus-square-o']}
          isExpanded={isExpandedAll}
          onClick={onExpandCollapseAll}
        />
      </Head>
      <BodyList>
        {listItems}
      </BodyList>
    </Root>
  );
};
