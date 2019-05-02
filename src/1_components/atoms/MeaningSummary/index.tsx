import * as React from 'react';

import { getEWordClassString, IMeaning, MPTypes } from 'myprodict-model/lib-esm';

import styles from './styles.module.scss';

interface MeaningSummaryProps {
  word: string;
  meanings: IMeaning[];
}

class MeaningSummary extends React.Component<MeaningSummaryProps> {
  render() {
    const {word, meanings} = this.props;

    return (
      <div className={'card ' + styles.MeaningSummary}>
        <div className={'card-header bg-warning'}>
          mean(s) of <b>{word}</b>
        </div>
        <ul className={'list-group'}>
          {meanings.map(meaning =>
            <li key={meaning.keyid} className={'list-group-item d-flex justify-content-between align-items-center'}>
              {meaning.value.mean}
              {meaning.value.word_class && meaning.value.word_class !== MPTypes.WordClass.all &&
              <span className={'text-info font-italic font-weight-600'}>
                {getEWordClassString(meaning.value.word_class)}
              </span>}
            </li>)}
        </ul>
      </div>
    );
  }
}

export default MeaningSummary;
