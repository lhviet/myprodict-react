import React, { ReactNode } from 'react';
import { getEWordClassString, IMeaningExample, IMeaningUsage } from 'myprodict-model/lib-esm';
import * as _ from 'lodash-es';
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
  usages: IMeaningUsage[];
  examples: IMeaningExample[];  // all examples of usages
  meaning?: string;
}
export default ({ usages, examples, meaning }: Props) => {
  // processing usages: grouping by value.usage & sorting
  const usageSubjs = _.uniq(_.map(usages, 'value.usage'));
  usageSubjs.sort((a: string, b: string) => a.length - b.length);

  const mean: ReactNode = meaning ? (
    <Title>{meaning}</Title>
  ) : undefined;

  return (
    <Root>
      {mean}
      <div className={'card-body pt-2 pb-1'}>
        {usageSubjs.map((uSubj, index) =>
          <div key={index} className={'mb-3 border-bottom'}>
            <div className={'text-uppercase font-weight-700'}>{uSubj}</div>
            <table className={'table table-hover'}>
              <tbody>
              {usages.filter(u => u.value.usage === uSubj)
                .map(u => <tr key={u.keyid} className={'pl-2 '}>
                  <td>
                    <div className={'pos-r'}>
                      {u.value.explanation}
                      <div className={'text-muted fs-d8e float-right font-italic'}>
                        {getEWordClassString(u.value.word_class)}
                      </div>
                    </div>
                    {_.filter(examples, {value: {meaning_usage_keyid: u.keyid}})
                      .map(ex => <div key={ex.keyid} className={'text-muted font-italic pl-3'}>
                        - {ex.value.sentence}
                      </div>)}
                  </td>
                </tr>)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Root>
  );
};
