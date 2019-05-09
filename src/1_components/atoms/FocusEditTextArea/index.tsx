import React, { useState } from 'react';
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
  const [text, setText] = useState(props.value || '');
  const matches = text.match(/\S+/g);
  const wordNumber = matches ? matches.length : 0;
  const wordNumberLabel = `${wordNumber} word${wordNumber > 1 ? 's' : ''}`;

  const onChange = ({ currentTarget }: React.SyntheticEvent<HTMLTextAreaElement>) => setText(currentTarget.value);
  const onClick = () => setReadOnly(false);
  const onBlur = () => {
    setReadOnly(true);
    if (props.onBlur) {
      props.onBlur(text);
    }
  };

  return (
    <Root>
      <TextArea
        value={text}
        className={props.className}
        readOnly={isReadOnly}
        onChange={onChange}
        onBlur={onBlur}
        onMouseOut={onBlur}
        onClick={onClick}
      />
      <WordCount>{wordNumberLabel}</WordCount>
    </Root>
  );
};
