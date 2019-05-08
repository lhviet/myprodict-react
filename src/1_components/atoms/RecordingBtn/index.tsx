import React, { useState } from 'react';
import styled from 'styled-components';
import { interval, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import * as _ from 'lodash-es';

import { styles } from '^/theme';

interface ButtonProps {
  isCountingDown: boolean;
}
const Root = styled.button<ButtonProps>`
  ${styles.primaryBtn};
  position: relative;
  width: 5.6rem;
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

// tslint:disable-next-line:no-magic-numbers
const numbers$ = interval(1000);
const cancel$ = new Subject();
cancel$.pipe(takeUntil(cancel$));

const makeReadyLabel = (sum: number, countNum: number): string => {
  const dots = _.join(_.times(sum - countNum, () => '..'), '');
  return `${dots}${countNum}`;
};

enum MicStatus {
  Stop = 'Stop',
  Start = 'Start',
  NoMic = 'No Mic',
}
interface Props {
  isMicAvailable: boolean;
  isRecording?: boolean;
  countdown?: number;
  className?: string;
  onClick(): void;
}
export default ({ isMicAvailable, isRecording, countdown, className, onClick }: Props) => {
  const [currentCountdown, setCountdown] = useState(-1);

  let recordingLabel: string = isMicAvailable ? MicStatus.Start : MicStatus.NoMic;
  if (countdown && currentCountdown > 0) {
    recordingLabel = makeReadyLabel(countdown, currentCountdown);
  } else if (isRecording) {
    recordingLabel = MicStatus.Stop;
  }

  const iconMicClassName = isMicAvailable ? 'fa-microphone' : 'fa-microphone-slash';
  const iconRecordingClassName = isRecording ? 'fa-microphone an-pulse-btn' : iconMicClassName;
  const iconClassName = `fa ${iconRecordingClassName} ${className}`;

  const handleButtonClick = () => {
    if (isRecording) {
      onClick();
      return;
    }
    if (countdown) {
      setCountdown(currentCountdown < 0 ? countdown : -1);
      if (currentCountdown > -1) {
        cancel$.next();
        return;
      }
      const countdownFrom = countdown - 1;
      numbers$.pipe(
        take(countdown),
        takeUntil(cancel$),
      ).subscribe(x => {
        setCountdown(countdownFrom - x);
        if (x === countdownFrom) {
          onClick();
        }
      });
    } else {
      onClick();
    }
  };

  return (
    <Root isCountingDown={false} onClick={handleButtonClick} >
      {recordingLabel}
      <Icon className={iconClassName} />
    </Root>
  );
};
