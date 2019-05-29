import * as _ from 'lodash-es';
import React, { RefObject } from 'react';
import styled from 'styled-components';

import { alpha, colors, styles } from '^/theme';

import { countWord } from '^/4_services/word-service';

const Root = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: .8rem;
`;
const TextArea = styled.textarea.attrs({
  placeholder: 'Paste or type the sentences you want to practice here.',
})`
  width: 100%;
  padding: 0;
  border: none;
  resize: vertical;
  font-family: Roboto, sans-serif;
  font-size: 1.3rem;
  font-weight: 400;
  color: ${colors.dark.alpha(alpha.alpha9).toString()};
  ${styles.scrollbar};
  
  :focus {
    outline: none;
  }
`;
const HiddenTextArea = styled(TextArea).attrs({
  rows: 1,
})`
  height: 0;
`;
const WordCount = styled.span`
  position: absolute;
  bottom: -.5rem;
  left: 0;
  font-size: 0.8rem;
  font-style: italic;
  color: ${colors.grey.alpha(alpha.alpha8).toString()};
`;

interface Props {
  value?: string;
  className?: string;
  onBlur?(value: string): void;
}
interface State {
  isReadOnly: boolean;
}
export default class FocusEditTextArea extends React.Component<Props, State> {
  ref: RefObject<HTMLTextAreaElement>;
  refHidden: RefObject<HTMLTextAreaElement>;

  constructor(props: Readonly<Props>) {
    super(props);

    this.ref = React.createRef();
    this.refHidden = React.createRef();

    this.state = {
      isReadOnly: true,
    };
  }

  componentDidUpdate(): void {
    this.resizeTextArea();
  }

  resizeTextArea = () => {
    if (this.ref.current && this.refHidden.current) {
      const newHeight: number = this.refHidden.current.scrollHeight;
      this.ref.current.setAttribute('style', `height: ${newHeight}px`);
    }
  }

  onClick = () => this.setState({ isReadOnly: false });
  onBlur = () => this.setState({ isReadOnly: true });
  onChange = ({ currentTarget }: React.SyntheticEvent<HTMLTextAreaElement>) => {
    this.resizeTextArea();
    if (this.props.onBlur) {
      this.props.onBlur(currentTarget.value);
    }
  }

  render() {
    const { value, className }: Props = this.props;
    const { isReadOnly }: State = this.state;
    const text = value || '';

    const wordNumber = countWord(text);
    const wordNumberLabel = `${wordNumber} word${wordNumber > 1 ? 's' : ''}`;

    return (
      <Root>
        <HiddenTextArea value={text} ref={this.refHidden} />
        <TextArea
          value={text}
          className={className}
          readOnly={isReadOnly}
          onClick={this.onClick}
          onBlur={this.onBlur}
          onMouseOut={this.onBlur}
          onChange={this.onChange}
          ref={this.ref}
        />
        <WordCount>{wordNumberLabel}</WordCount>
      </Root>
    );
  }
}
