import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { colors, styles } from '^/theme';

const wordCountAlpha = 0.8;
const colorAlpha = 0.9;
const Root = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: .8rem;
`;
const TextArea = styled.textarea.attrs({
  placeholder: 'Paste or type the sentences you want to practice here.',
  rows: 6,
})`
  width: 100%;
  border: none;
  resize: vertical;
  font-family: Roboto, sans-serif;
  font-size: 1.3rem;
  font-weight: 400;
  color: ${colors.dark.alpha(colorAlpha).toString()};
  ${styles.scrollbar};
  
  :focus {
    outline: none;
  }
`;
const WordCount = styled.span`
  position: absolute;
  bottom: -.5rem;
  left: 0;
  font-size: 0.8rem;
  font-style: italic;
  color: ${colors.grey.alpha(wordCountAlpha).toString()};
`;

interface Props {
  value?: string;
  className?: string;
  onBlur?(value: string): void;
}
export default (props: Props) => {
  const [isReadOnly, setReadOnly] = useState(true);
  const text = props.value || '';

  const matches = text.match(/\S+/g);
  const wordNumber = matches ? matches.length : 0;
  const wordNumberLabel = `${wordNumber} word${wordNumber > 1 ? 's' : ''}`;

  const onClick = () => setReadOnly(false);
  const onBlur = () => setReadOnly(true);
  const onChange = ({ currentTarget }: React.SyntheticEvent<HTMLTextAreaElement>) => {
    if (props.onBlur) {
      props.onBlur(currentTarget.value);
    }
  };

  return (
    <Root>
      <TextArea
        value={text}
        className={props.className}
        readOnly={isReadOnly}
        onClick={onClick}
        onBlur={onBlur}
        onMouseOut={onBlur}
        onChange={onChange}
      />
      <WordCount>{wordNumberLabel}</WordCount>
    </Root>
  );
};
