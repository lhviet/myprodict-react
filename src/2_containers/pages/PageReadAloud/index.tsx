import * as _ from 'lodash-es';
import React, { ReactNode } from 'react';
import { Action, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { capitalize } from 'lodash-es';
import * as Diff from 'diff';
import styled from 'styled-components';
import { IReadAloud } from 'myprodict-model/lib-esm';

import { StoreState } from '^/types';
import { colors, styles } from '^/theme';

import FocusEditTextArea from '^/1_components/atoms/FocusEditTextArea';
import RecordingBtn from '^/1_components/atoms/RecordingBtn';
import WaveSurferItem from '^/1_components/atoms/WaveSurferItem';
import SpeechDiffResultRaw, { Props as SpeechDiffResultProps } from '^/1_components/molecules/SpeechDiffResult';
import ListSearchWord from '^/2_containers/components/ListSearchWord';
import { actionSearchWord, WordState } from '^/3_store/ducks/word';
import { fetchReadAloud } from '^/3_store/ducks/read_aloud';
import { getWords, getMissingWords } from '^/4_services/word-service';

import PageLayout from '../_PageLayout';

const alpha7 = .7;
const Root = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  height: calc(100vh - 3rem);
  overflow: hidden;
`;

interface DisplayProps {
  isDisplay?: boolean;
}
const Left = styled.div`
  width: 30%;
  max-width: 300px;
  background-color: #fff;
  border-right: solid 1px ${colors.borderGray.toString()};
  transition: width ease .3s;
`;
const Right = styled.div`
  width: 100%;
  height: 100%;
  padding: .2rem  1rem;
  overflow-y: auto;
  overscroll-behavior: contain;
  ${styles.scrollbar};
`;

interface RightBodyProps {
  isMarginTop?: boolean;
}
const RightBody = styled.div<RightBodyProps>`
  width: 100%;
  margin-top: ${props => props.isMarginTop && '80px'};
  margin-right: auto;
  margin-left: auto;
  min-width: 400px;
  max-width: 1200px;
  transition: width ease .1s, margin-top ease .3s;
`;
const TextAreaWrapper = styled.div`
  padding: .75rem 1rem .5rem 1rem;
  border-radius: 5px;
  background-color: #fff;
`;
const RecordingBtnWrapper = styled.div`
  text-align: center;
  margin-top: 1rem;
`;

interface DisplayProps {
  isDisplay?: boolean;
}
const SpeechDiffResult = styled(SpeechDiffResultRaw)<DisplayProps>`
  border-radius: 5px;
  background-color: #fff;
  transition: transform ease .2s, min-height ease .2s;
  transform: ${props => props.isDisplay ? 'translateY(0)' : 'translateY(-100%)'};
  display: ${props => props.isDisplay ? 'flex' : 'none'};
`;
const SpeechDiffResultListItem = styled(SpeechDiffResultRaw)`
  border-bottom: solid 1px ${colors.borderGray.alpha(alpha7).toString()};
  margin-top: 0;
  margin-bottom: 0;
`;
const SpeechDiffList = styled.div<DisplayProps>`
  margin-top: 1rem;
  border-radius: 5px;
  background-color: #fff;
  transition: transform ease .2s, min-height ease .2s;
  transform: ${props => props.isDisplay ? 'translateY(0)' : 'translateY(-100%)'};
  display: ${props => props.isDisplay ? 'block' : 'none'};
`;

enum RecordStatus {
  Idle = 1,
  Ready,
  Recording,
  Stopped,
}
interface Props {
  ras: Array<IReadAloud>;
  word: WordState;

  fetchReadAloud(order: number): any;
  searchWord(words: Array<string>): any;
}
interface State {
  recordStatus: RecordStatus;
  isMicAvailable: boolean;

  ra?: IReadAloud;
  sampleText: string;
  missingWords: Array<string>;

  attempts: Array<SpeechDiffResultProps>;
}
class PageReadAloud extends React.Component<Props, State> {
  audioChunks: any[] = [];
  audioBlob: Blob | undefined;
  mediaRecorder: MediaRecorder | undefined;
  speechRecognition: SpeechRecognition | undefined;

  constructor(props: Props, context: any) {
    super(props, context);

    const isSpeechAvailable: boolean = 'webkitSpeechRecognition' in window;
    if (isSpeechAvailable) {
      this.speechRecognition = new webkitSpeechRecognition() as SpeechRecognition;
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = false;
      this.speechRecognition.onresult = this.onRecognitionResult;
    } else {
      console.error('SpeechRecognition is not available on this browser.');
    }

    props.fetchReadAloud(1);

    this.state = {
      recordStatus: RecordStatus.Idle,
      isMicAvailable: true,
      sampleText: '',
      missingWords: [],
      attempts: [],
    };
  }

  componentDidUpdate({ras: prevRas}: Readonly<Props>, {sampleText : prevText}: Readonly<State>): void {
    const { ras }: Props = this.props;
    if (prevRas.length === 0 && ras.length > 0 && prevText.length === 0) {
      const { ra_content: sampleText } = ras[0].value;
      const keyWords = getWords(sampleText);
      if (keyWords.length > 0) {
        const keywordLength = 4;
        this.props.searchWord(keyWords.filter(w => w.length > keywordLength));
      }

      this.setState({
        ra: ras[0],
        sampleText,
      });
    }
  }

  onRecognitionResult = (event: SpeechRecognitionEvent) => {
    const { sampleText }: State = this.state;

    let finalTranscript = '';
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    const diffWords = Diff.diffWords(sampleText, finalTranscript, { ignoreCase: true });
    const missingWords = getMissingWords(diffWords);

    const availableWords = this.props.word.words.map(w => _.toLower(w.value.word));
    const needToSearchWords = _.difference(missingWords.map(_.toLower), availableWords);
    if (needToSearchWords.length > 0) {
      this.props.searchWord(needToSearchWords);
    }

    const attempts = [
      {
        datetime: new Date(),
        sampleText,
        recognitionText: capitalize(finalTranscript),
        recordAudioBlob: this.audioBlob,
      },
      ...this.state.attempts,
    ];
    this.setState({
      attempts,
      missingWords,
    });
  }

  startRecording = async () => {
    try {
      const stream: MediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
      const option = {
        mimeType : 'audio/webm'
      };
      this.mediaRecorder = new MediaRecorder(stream, option);
      this.mediaRecorder.ondataavailable = (event: BlobEvent) => this.audioChunks.push(event.data);
      this.mediaRecorder.onstart = () => {
        this.audioChunks = [];
        this.audioBlob = undefined;
      };
      this.mediaRecorder.onstop = () => {
        this.audioBlob = new Blob(this.audioChunks, {type: 'audio/webm; codecs=opus'});
      };

      this.mediaRecorder.start();
      if (this.speechRecognition) {
        this.speechRecognition.start();
      }

      this.setState({
        isMicAvailable: true,
        recordStatus: RecordStatus.Recording,
      });
    } catch (e) {
      console.error(e);
      this.setState({isMicAvailable: false});
    }
  }
  stopRecording = () => {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(t => t.stop());
    }
    if (this.speechRecognition) {
      this.speechRecognition.stop();
    }
    this.setState({recordStatus: RecordStatus.Stopped});
  }

  handleTextBlur = (value: string) => {
    this.setState({sampleText: value});
  }

  handleRecordingClick = (isCountingdown?: boolean) => {
    if (isCountingdown) {
      this.setState({ recordStatus: RecordStatus.Ready });
      return;
    }
    if (this.state.recordStatus === RecordStatus.Recording) {
      this.stopRecording();
    } else if (this.state.isMicAvailable) {
      this.startRecording();
    }
  }

  render() {
    const {
      recordStatus, isMicAvailable, ra, sampleText, missingWords, attempts,
    }: State = this.state;

    const isRecording: boolean = recordStatus === RecordStatus.Recording;
    const isRecordStopped: boolean = recordStatus === RecordStatus.Stopped;

    const lastAttempt = _.first(attempts);
    const remainAttempts = attempts.length > 1 ? attempts.slice(1) : [];
    const lastAttemptNode: ReactNode = lastAttempt ? (
      <SpeechDiffResult
        isDisplay={isRecordStopped}
        {...lastAttempt}
        order={1}
      />
    ) : undefined;
    const attemptListItems: ReactNode = remainAttempts.map((attempt, index) => {
      const orderFrom = 2;
      const order = orderFrom + index;

      return (
        <SpeechDiffResultListItem
          key={index}
          {...attempt}
          order={order}
        />
      );
    });
    const attemptList: ReactNode = remainAttempts.length > 0 ? (
      <SpeechDiffList isDisplay={isRecordStopped}>
        {attemptListItems}
      </SpeechDiffList>
    ) : undefined;

    const isFirstRecord = attempts.length === 0;

    return (
      <PageLayout>
        <Root>
          <Left>
            <ListSearchWord exactWords={missingWords} />
          </Left>
          <Right>
            <RightBody isMarginTop={!isRecordStopped}>
              <TextAreaWrapper>
                <FocusEditTextArea value={sampleText} onBlur={this.handleTextBlur} />
                <WaveSurferItem hidden={!isRecordStopped} audio={ra ? ra.value.audio_url : undefined} />
                <RecordingBtnWrapper>
                  <RecordingBtn
                    isFirstRecord={isFirstRecord}
                    isRecording={isRecording}
                    isMic={isMicAvailable}
                    onClick={this.handleRecordingClick}
                  />
                </RecordingBtnWrapper>
              </TextAreaWrapper>
              {lastAttemptNode}
              {attemptList}
            </RightBody>
          </Right>
        </Root>
      </PageLayout>
    );
  }
}

const mapStateToProps = (state: StoreState) => ({
  ras: state.readAloud.ras,
  word: state.word,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  fetchReadAloud(order: number): void {
    dispatch(fetchReadAloud(order));
  },
  searchWord(words: Array<string>): void {
    dispatch(actionSearchWord(words));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PageReadAloud);
