import React, { RefObject } from 'react';
import styled from 'styled-components';
import {fromEvent, interval, Observable} from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import * as _ from 'lodash-es';

import { styles } from '^/theme';

interface ButtonProps {
  isCountingDown: boolean;
}
const Root = styled.button<ButtonProps>`
  ${styles.primaryBtn};
  position: relative;
  width: 6rem;
  font-size: 1.1rem;
  line-height: 1.2;
  padding: .45rem .35rem .375rem .75rem;
  text-align: left;
`;
const Icon = styled.i`
  position: absolute;
  top: 0.2rem;
  right: 0.2rem;
  font-size: 1.3rem;
  text-align: center;
  height: 1.1rem;
  width: 1.1rem;
  padding: 0.3rem;
`;

enum MicStatus {
  Stop = 'Stop',
  Start = 'Start',
  NoMic = 'No Mic',
}

interface Props {
  isMicAvailable?: boolean;
  isRecording?: boolean;
  countdown?: number;
  className?: string;
  onClick?(event?: React.SyntheticEvent): void;
}
interface State {
  currentCountdown: number;
}
class RecordingBtn extends React.Component<Props, State> {
  btnRef: RefObject<HTMLButtonElement>;
  numbers$ = interval(1000);
  cancel$: Observable<any> | undefined;

  constructor(props: Props, context: any) {
    super(props, context);
    this.btnRef = React.createRef();
    this.state = {
      currentCountdown: -1
    };
  }

  componentDidMount(): void {
    this.cancel$ = fromEvent(this.btnRef.current as HTMLButtonElement, 'click');
  }

  render() {
    const { isMicAvailable, isRecording, countdown, className, onClick }: Props = this.props;
    const { currentCountdown }: State = this.state;
    const makeReadyLabel = (sum: number, countNum: number): string => `${countNum}.${_.join(_.times(sum - countNum, () => '.'), '') }`;

    const recordingLabel: string = countdown && currentCountdown > 0 ?
      makeReadyLabel(countdown, currentCountdown) : isRecording ?
        MicStatus.Stop : (isMicAvailable ?
          MicStatus.Start : MicStatus.NoMic);

    const iconMicClassName = isMicAvailable ? 'fa-microphone' : 'fa-microphone-slash';
    const iconRecordingClassName = isRecording ? 'fa-microphone an-pulse-btn' : iconMicClassName;
    const iconClassName = `fa ${iconRecordingClassName} ${className}`;

    const handleButtonClick = () => {
      if (isRecording) {
        if (onClick) {
          onClick();
        }
        return;
      }
      if (countdown) {
        this.setState({currentCountdown: currentCountdown < 0 ? countdown : -1});
        if (currentCountdown > -1) {
          return;
        }
        if (this.cancel$) {
          this.numbers$
            .pipe(
              take(3),
              takeUntil(this.cancel$),
            ).subscribe(x => {
            this.setState({currentCountdown: countdown - x - 1});
            if (x === (countdown - 1) && onClick) {
              onClick();
            }
          });
        }
      } else {
        if (onClick) {
          onClick();
        }
      }
    };

    return (
      <Root isCountingDown={false} onClick={handleButtonClick} ref={this.btnRef}>
        {recordingLabel}
        <Icon className={iconClassName} />
      </Root>
    );
  }
}
export default RecordingBtn;
