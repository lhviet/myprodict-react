import React from 'react';
import { getEWordClassString, IMeaningExample, IMeaningUsage } from 'myprodict-model/lib-esm';
import * as _ from 'lodash-es';
import styled from 'styled-components';

const Root = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 4.5rem;
  word-wrap: break-word;
  background-clip: border-box;
  background-color: #fff;
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

  return (
    <Root className={className}>
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
    </Root>
  );
};
