import * as React from 'react';
import { Link } from 'react-router-dom';

interface CardExampleSentenceProps {
  word: string;
  examples: string[];
  wordCustomUrl?: string;
}

class CardExampleSentence extends React.Component<CardExampleSentenceProps> {
  render() {
    const {word, wordCustomUrl, examples} = this.props;
    const reg = new RegExp(word, 'g');

    return (
      <div className={'component-card-example-sentence card '}>
        <div className={'card-header font-italic'}>{'example sentences'}</div>
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
      </div>
    );
  }
}

export default CardExampleSentence;
