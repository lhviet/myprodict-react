import React, { ReactNode } from 'react';
import styled from 'styled-components';
import * as Diff from 'diff';
import * as _ from 'lodash-es';
import moment from 'moment';

import { colors } from '^/theme';

import LoadingIconRaw from '^/1_components/atoms/LoadingIcon';
import WaveSurferItem from '^/1_components/atoms/WaveSurferItem';
import { countWord, getMissingWords } from '^/4_services/word-service';
import { getPercentage } from '^/4_services/calc-service';
import { downloadRecordingAudio } from '^/4_services/file-service';

const alpha6 = 0.6;
const alpha8 = 0.8;
const alpha9 = 0.9;
interface DisplayProps {
  isDisplay?: boolean;
}

const Root = styled.div`
  position: relative;
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding: .75rem;
  min-height: 250px;
`;
const TimeLabel = styled.div`
  font-size: .9rem;
  font-weight: 300;
  color: ${colors.blueDark.alpha(alpha8).toString()};
  margin-bottom: .3rem;
`;
const Title = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${colors.dark.alpha(alpha8).toString()};
  margin-bottom: .3rem;
`;
const CorrectPercentage = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: ${colors.red.alpha(alpha6).toString()};
`;
const RecognitionWrapper = styled.div<DisplayProps>`
  width: 100%;
  height: ${props => props.isDisplay ? 'auto' : 0};
  transition: height ease .1s;
`;
const RecognitionTextWrapper = styled.div`
  color: ${colors.dark.alpha(alpha9).toString()};
`;
const DiffTextWrapper = styled.div`
  margin-top: 1rem;
  font-size: 1.1rem;
`;
const DiffTextCorrect = styled.span`
  color: ${colors.blue.toString()};
`;
const DiffTextMissed = styled.span`
  color: ${colors.red.toString()};
`;
const DiffTextAdded = styled.span`
  color: ${colors.grey.toString()};
  text-decoration: line-through;
  margin-left: .2rem;
`;
const DownloadBtn = styled.i.attrs({
  title: 'Download'
})`
  position: absolute;
  top: .5rem;
  right: .6rem;
  font-size: 1.1rem;
  color: ${colors.grey.alpha(alpha6).toString()};
  cursor: pointer;
  
  :hover {
    color: ${colors.grey.toString()};
  }
`;
const MissingWordTitle = styled.div`
  margin-top: .5rem;
  font-size: .9rem;
  color: ${colors.grey.alpha(alpha9).toString()};
`;
const MissingWords = styled.div`
  margin-top: .2rem;
  font-size: .9rem;
  color: ${colors.grey.alpha(alpha6).toString()};
`;
const LoadingIcon = styled(LoadingIconRaw)<DisplayProps>`
  margin: 0 auto;
  align-self: center;
  transition: display ease-in .2s;
  display: ${props => !props.isDisplay && 'none'};
`;

const countCorrectWord = (diffWords: Array<Diff.Change>): number =>
  _.reduce(diffWords, (sum, w) => w.added || w.removed ? sum : sum + countWord(w.value), 0);

export interface Props {
  datetime: Date;
  sampleText: string;
  recognitionText: string;
  recordAudioBlob?: Blob;
  order?: number;

  className?: string;
}
export default ({ datetime, sampleText, recognitionText, recordAudioBlob, order, className }: Props) => {
  const onDownload = () => recordAudioBlob && downloadRecordingAudio(recordAudioBlob, correctPercent);

  const diffWords = Diff.diffWords(sampleText, recognitionText, { ignoreCase: true });
  const missingWord = getMissingWords(diffWords).join(', ');
  const correctCount = countCorrectWord(diffWords);
  const totalCount = countWord(sampleText);
  const correctPercent = getPercentage(correctCount, totalCount);

  const orderLabel: ReactNode = order ? `${order} - ` : undefined;
  const timeLabel: string = moment(datetime).format('HH:mm-YYYY.MM.DD');
  const isDisplayRecognition = recognitionText.length > 0;

  const correctTitle: ReactNode = (
    <Title>
      Correct: {correctCount}/{totalCount} words
      <CorrectPercentage>
        ({correctPercent}%)
      </CorrectPercentage>
    </Title>
  );

  const speechResult: ReactNode = diffWords.map(({ value, added, removed }, index) => {
    return added ? (
      <DiffTextAdded key={index}>{value}</DiffTextAdded>
    ) : (removed ? (
      <DiffTextMissed key={index}>{value}</DiffTextMissed>
    ) : (
      <DiffTextCorrect key={index}>{value}</DiffTextCorrect>
    ));
  });

  return (
    <Root className={className}>
      <RecognitionWrapper isDisplay={isDisplayRecognition}>
        <Title>
          {orderLabel}
          <TimeLabel>
            {timeLabel}
          </TimeLabel>
          Your Speech:
        </Title>
        <DownloadBtn className={'fa fa-cloud-download'} onClick={onDownload} />
        <WaveSurferItem audio={recordAudioBlob} />
        <RecognitionTextWrapper>
          {recognitionText}
        </RecognitionTextWrapper>
        <DiffTextWrapper>
          {correctTitle}
          {speechResult}
        </DiffTextWrapper>
        <MissingWordTitle>Missing words:</MissingWordTitle>
        <MissingWords>
          {missingWord}
        </MissingWords>
      </RecognitionWrapper>
      <LoadingIcon isDisplay={!isDisplayRecognition} />
    </Root>
  );
};
