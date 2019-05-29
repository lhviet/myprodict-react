import React, { ReactNode } from 'react';
import { IMeaningExample, IMeaningUsage } from 'myprodict-model/lib-esm';
import * as _ from 'lodash-es';
import styled from 'styled-components';

import { alpha, colors } from '^/theme';

const Root = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 4.5rem;
  word-wrap: break-word;
  background-clip: border-box;
  background-color: #fff;
`;
const UsageItemWrapper = styled.div`
  padding-bottom: .3rem;
  margin-bottom: .3rem;
  border-bottom: dashed 1px ${colors.borderGray.alpha(alpha.alpha6).toString()};
  
  :last-child {
    border-bottom: none;
  }
`;
const UsageItemTitle = styled.div`
  font-size: 0.9rem;
  font-style: italic;
  color: ${colors.grey.toString()};
`;
const UsageItemCollocation = styled.span`
  margin-left: .4rem;
  font-size: 1.2rem;
  font-weight: 500;
  font-style: normal;
  color: ${colors.dark.toString()};
`;
const UsageExplanationWrapper = styled.div`
  margin-left: 1rem;
`;
const Explanation = styled.div`
  line-height: 2;
  font-weight: 500;
  color: ${colors.dark.toString()};
`;
const Sentence = styled.div`
  margin-left: 0.5rem;
  line-height: 1.5;
  color: ${colors.grey.toString()};
`;

interface Props {
  usages: IMeaningUsage[];
  examples: IMeaningExample[];  // all examples of usages
  className?: string;
}
export default ({ usages, examples, className }: Props) => {
  // processing usages: grouping by value.usage & sorting
  const usageSubjs = _.uniq(_.map(usages, 'value.usage'));
  usageSubjs.sort((a: string, b: string) => a.length - b.length);

  const wordUsages: ReactNode = usageSubjs.map((uSubj, index) => {
    const usageTitle: ReactNode = uSubj ? (
      <UsageItemTitle>
        Use as/with <UsageItemCollocation>{uSubj}</UsageItemCollocation>
      </UsageItemTitle>
    ) : undefined;

    const usageExplanation: ReactNode = usages
      .filter(u => u.value.usage === uSubj)
      .map(u => (
        <UsageExplanationWrapper key={u.keyid}>
          <Explanation>
            {u.value.explanation}
          </Explanation>
          {
            _.filter(examples, {value: {meaning_usage_keyid: u.keyid}})
              .map(ex => <Sentence key={ex.keyid}>
                - {ex.value.sentence}
              </Sentence>)
          }
        </UsageExplanationWrapper>
      ));

    return (
      <UsageItemWrapper key={index}>
        {usageTitle}
        {usageExplanation}
      </UsageItemWrapper>
    );
  });

  return (
    <Root className={className}>
      {wordUsages}
    </Root>
  );
};
