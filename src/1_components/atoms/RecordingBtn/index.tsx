import React, { useState } from 'react';
import styled from 'styled-components';
import { interval, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import * as _ from 'lodash-es';

import { colors, styles } from '^/theme';

interface RootProps {
  isRecording?: boolean;
}
const Root = styled.button<RootProps>`
  ${styles.primaryOutlineBtn};
  position: relative;
  width: 6.6rem;
  font-size: 1.1rem;
  line-height: 1.2;
  padding: .45rem .35rem .375rem .75rem;
  text-align: left;
  
  border-color: ${({ isRecording }) => isRecording && colors.grey.alpha(.5).toString()};
  color: ${({ isRecording }) => isRecording && colors.grey.alpha(.7).toString()};
  
  i {
    color: ${({ isRecording }) => isRecording && '#fff'};
  }
  :hover {
    color: ${({ isRecording }) => isRecording && colors.red.toString()};
  }
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

const defaultCountdown = 3;
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
  onClick(isCountingdown?: boolean): void;
}
export default ({ isMicAvailable, isRecording, countdown, className, onClick }: Props) => {
  const [currentCountdown, setCountdown] = useState(-1);

  let theCountdown = countdown || defaultCountdown;
  let recordingLabel: string = isMicAvailable ? MicStatus.Start : MicStatus.NoMic;
  if (theCountdown && currentCountdown > 0) {
    recordingLabel = makeReadyLabel(theCountdown, currentCountdown);
  } else if (isRecording) {
    recordingLabel = MicStatus.Stop;
  }

  const iconMicClassName = isMicAvailable ? 'fa-microphone' : 'fa-microphone-slash';
  const iconRecordingClassName = isRecording ? 'fa-microphone an-pulse-btn' : iconMicClassName;
  const iconClassName = `fa ${iconRecordingClassName} ${className}`;

  const handleButtonClick = () => {
    onClick(!!theCountdown);
    if (isRecording) {
      onClick();
      return;
    }
    if (theCountdown) {
      setCountdown(currentCountdown < 0 ? theCountdown : -1);
      if (currentCountdown > -1) {
        cancel$.next();
        return;
      }
      const countdownFrom = theCountdown - 1;
      numbers$.pipe(
        take(theCountdown),
        takeUntil(cancel$),
      ).subscribe(x => {
        setCountdown(countdownFrom - x);
        if (x === countdownFrom) {
          onClick();
          setCountdown(-1);
        }
      });
    } else {
      onClick();
    }
  };

  return (
    <Root isRecording={isRecording} onClick={handleButtonClick} >
      {recordingLabel}
      <Icon className={iconClassName} />
    </Root>
  );
};
