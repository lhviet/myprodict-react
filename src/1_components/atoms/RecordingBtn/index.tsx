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
const intervalMilliseconds = 1000;
const count$ = interval(intervalMilliseconds);
const cancel$ = new Subject();
const makeReadyLabel = (sum: number, countNum: number): string => {
  const dots = _.join(_.times(sum - countNum, () => '..'), '');
  return `${dots}${countNum}`;
};

enum MicStatus {
  Start = 'Start',
  NoMic = 'No Mic',
}
interface Props {
  isMic: boolean;
  isRecording: boolean;
  countdown?: number;
  className?: string;
  onClick(isCountingdown?: boolean): void;
}
export default ({ isMic, isRecording, countdown, className, onClick }: Props) => {
  const [currentCountdown, setCountdown] = useState(-1);
  const [currentCountup, setCountup] = useState(0);

  const theCountdown: number = countdown === undefined ? defaultCountdown : countdown;
  let recordingLabel: string = isMic ? MicStatus.Start : MicStatus.NoMic;
  if (theCountdown && currentCountdown > 0) {
    recordingLabel = makeReadyLabel(theCountdown, currentCountdown);
  } else if (isRecording) {
    recordingLabel = currentCountup.toString();
  }

  const iconMicClassName = isMic ? 'fa-microphone' : 'fa-microphone-slash';
  const iconRecordingClassName = isRecording ? 'fa-microphone an-pulse-btn' : iconMicClassName;
  const iconClassName = `fa ${iconRecordingClassName} ${className}`;

  const startRecording = () => {
    onClick();
    count$.pipe(
      takeUntil(cancel$),
    ).subscribe(x => {
      setCountup(x + 1);
    });
  };
  const handleButtonClick = () => {
    if (isRecording) {
      onClick();
      setCountup(0);
      cancel$.next();
      return;
    }
    if (theCountdown > 0) {
      onClick(true);
      setCountdown(currentCountdown < 0 ? theCountdown : -1);
      if (currentCountdown > -1) {
        cancel$.next();
        return;
      }
      const countdownFrom = theCountdown - 1;
      count$.pipe(
        take(theCountdown),
        takeUntil(cancel$),
      ).subscribe(x => {
        setCountdown(countdownFrom - x);
        if (x === countdownFrom) {
          startRecording();
          setCountdown(-1);
        }
      });
    } else {
      startRecording();
    }
  };

  return (
    <Root isRecording={isRecording} onClick={handleButtonClick} >
      {recordingLabel}
      <Icon className={iconClassName} />
    </Root>
  );
};
