import * as React from 'react';
import { getEWordClassString, IMeaningExample, IMeaningUsage } from 'myprodict-model/lib-esm';
import * as _ from 'lodash-es';

import style from './style.module.scss';

interface CardMeaningProps {
  usages: IMeaningUsage[];
  examples: IMeaningExample[];  // all examples of usages
  meaning?: string;
}

class CardMeaning extends React.Component<CardMeaningProps> {
  render() {
    const {meaning, usages, examples} = this.props;

    // processing usages: grouping by value.usage & sorting
    const usageSubjs = _.uniq(_.map(usages, 'value.usage'));
    usageSubjs.sort((a: string, b: string) => a.length - b.length);

    return (
      <div className={'card ' + style.CardMeaning}>
        {meaning && <h5 className={'card-header text-primary'}>{meaning}</h5>}
        <div className={'card-body pt-2 pb-1'}>
          {usageSubjs.map((uSubj, index) =>
            <div key={index} className={'mb-3 border-bottom'}>
              <div className={'text-uppercase font-weight-700'}>{uSubj}</div>
              <table className={'table table-hover'}>
                <tbody>
                {usages.filter(u => u.value.usage === uSubj)
                  .map(u => <tr key={u.keyid} className={'pl-2 ' + style.Explanation}>
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
      </div>
    );
  }
}

export default CardMeaning;
