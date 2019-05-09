import React, { ReactNode, RefObject } from 'react';
import { Action, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { capitalize } from 'lodash-es';
import WaveSurfer from 'wavesurfer.js';
import * as Diff from 'diff';
import styled from 'styled-components';

import { IStoreState } from '^/types';
import { colors, styles } from '^/theme';

import FocusEditTextArea from '^/1_components/atoms/FocusEditTextArea';
import RecordingBtn from '^/1_components/atoms/RecordingBtn';
import ListSearchWord from '^/2_containers/components/ListSearchWord';
import { actionSearchWord, IWordState } from '^/3_store/ducks/word';

import PageLayout from '../_PageLayout';
import LoadingIconRaw from '^/1_components/atoms/LoadingIcon';
import { downloadRecordingAudio } from '^/4_services/file-service';

const alpha6 = 0.6;
const alpha8 = 0.8;
const alpha9 = 0.9;
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
`;
const Title = styled.label`
  font-weight: 600;
  color: ${colors.dark.alpha(alpha8).toString()};
`;

interface DisplayProps {
  isDisplay?: boolean;
}
const LoadingIcon = styled(LoadingIconRaw)<DisplayProps>`
  margin: 0 auto;
  align-self: center;
  transition: display ease-in .2s;
  display: ${props => !props.isDisplay && 'none'};
`;
const SpeechResult = styled.div<DisplayProps>`
  position: relative;
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding: .75rem;
  min-height: 250px;
  border-radius: 5px;
  background-color: #fff;
  transition: transform ease .2s, min-height ease .2s;
  transform: ${props => props.isDisplay ? 'translateY(0)' : 'translateY(200%)'};
  display: ${props => props.isDisplay ? 'flex' : 'none'};
`;
const RecognitionWrapper = styled.div<DisplayProps>`
  transition: display ease .2s, min-height ease .2s;
  display: ${props => props.isDisplay ? 'block' : 'none'};
`;
const LoadingWrapper = styled.div<DisplayProps>`
  width: 100%;
  text-align: center;
  align-self: center;
  transition: display ease-in .2s;
  display: ${props => props.isDisplay ? 'block' : 'none'};
`;
const WaveSurferTableWrapper = styled.table`
  border: none;
  width: 100%;
`;

const WaveSurferControlCol = styled.td`
  width: 1.5rem;
  text-align: right;
`;
const WaveSurferContainer = styled.td`
  width: auto;
`;
const RecognitionTextWrapper = styled.div`
  color: ${colors.dark.alpha(alpha9).toString()};
`;
const DiffTextWrapper = styled.div`
  margin-top: 1rem;
  font-size: 1.1rem;
  border-radius: 5px;
  background-color: #fff;
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
const PlayBtn = styled.i.attrs({
  title: 'Play/Pause'
})`
  font-size: 1.2rem;
  cursor: pointer;
  color: ${colors.grey.alpha(alpha8).toString()};
  
  :hover {
    color: ${colors.green.toString()};
  }
`;
const DownloadBtn = styled(PlayBtn).attrs({
  title: 'Download'
})`
  position: absolute;
  top: .5rem;
  right: .6rem;
  font-size: 1.1rem;
  color: ${colors.grey.alpha(alpha6).toString()};
  :hover {
    color: ${colors.grey.toString()};
  }
`;

enum RecordStatus {
  Idle = 1,
  Ready,
  Recording,
  Stopped,
}
interface Props {
  word: IWordState;
  searchWord(words: Array<string>): any;
}
interface State {
  recordStatus: RecordStatus;
  isMicAvailable: boolean;
  isPlaying: boolean;
  isTextAreaFocus: boolean;
  sampleText: string;
  recognitionText: string;
  diffWords: Array<Diff.Change>;
}
class PageReadAloud extends React.Component<Props, State> {
  audioChunks: any[] = [];
  mediaRecorder: MediaRecorder | undefined;
  audioBlob: Blob | undefined;
  speechRecognition: SpeechRecognition | undefined;

  waveSurferRef: RefObject<HTMLTableCellElement>;
  waveSurfer: WaveSurfer | undefined;

  constructor(props: Props, context: any) {
    super(props, context);
    this.waveSurferRef = React.createRef();

    const isSpeechAvailable: boolean = 'webkitSpeechRecognition' in window;
    if (isSpeechAvailable) {
      this.speechRecognition = new webkitSpeechRecognition() as SpeechRecognition;
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = false;
      this.speechRecognition.onresult = this.onRecognitionResult;
    } else {
      console.error('SpeechRecognition is not available on this browser.');
    }

    this.state = {
      recordStatus: RecordStatus.Idle,
      isMicAvailable: true,
      isPlaying: false,
      isTextAreaFocus: false,
      sampleText: '',
      recognitionText: '',
      diffWords: [],
    };
  }

  componentDidMount(): void {
    this.waveSurfer = WaveSurfer.create({
      container: this.waveSurferRef.current as HTMLTableCellElement,
      waveColor: 'gray',
      progressColor: 'black',
      cursorColor: 'black',
      barHeight: 1.3,
      height: 60,
      hideScrollbar: true,
    });
    this.waveSurfer.on('finish', () => {
      if (this.waveSurfer) {
        this.waveSurfer.stop();
      }
      this.setState({ isPlaying: false });
    });
  }

  onRecognitionResult = (event: SpeechRecognitionEvent) => {
    let finalTranscript = '';
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    const diffWords = Diff.diffWords(this.state.sampleText, finalTranscript, { ignoreCase: true });
    const missingWords = diffWords
      .filter(word => word.removed)
      .map(word => word.value);

    this.props.searchWord(missingWords);
    this.setState({
      recognitionText: capitalize(finalTranscript),
      diffWords,
    });
  }

  startRecording = async () => {
    try {
      const stream: MediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (event: BlobEvent) => this.audioChunks.push(event.data);
      this.mediaRecorder.onstart = () => {
        this.audioChunks = [];
      };
      this.mediaRecorder.onstop = () => {
        this.audioBlob = new Blob(this.audioChunks, {type: 'audio/mpeg-3'});
        if (this.waveSurfer) {
          this.waveSurfer.load(URL.createObjectURL(this.audioBlob));
        }
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

  playPauseWaveSurfer = () => {
    if (this.waveSurfer) {
      this.waveSurfer.playPause();
      this.setState((prevState) => ({ isPlaying: !prevState.isPlaying }));
    }
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

  downloadAudio = () => this.audioBlob && downloadRecordingAudio(this.audioBlob);

  render() {
    const {
      recordStatus, isMicAvailable, isPlaying, sampleText, recognitionText, diffWords,
    }: State = this.state;

    const isRecording: boolean = recordStatus === RecordStatus.Recording;
    const isRecordStopped: boolean = recordStatus === RecordStatus.Stopped;
    const waveIconClassName: string = `fa ${isPlaying ? 'fa-pause' : 'fa-play'}`;

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
      <PageLayout>
        <Root>
          <Left>
            <ListSearchWord />
          </Left>
          <Right>
            <RightBody isMarginTop={!isRecordStopped}>
              <TextAreaWrapper>
                <FocusEditTextArea value={sampleText} onBlur={this.handleTextBlur} />
                <RecordingBtnWrapper>
                  <RecordingBtn
                    isRecording={isRecording}
                    isMicAvailable={isMicAvailable}
                    onClick={this.handleRecordingClick}
                  />
                </RecordingBtnWrapper>
              </TextAreaWrapper>
              <SpeechResult isDisplay={isRecordStopped}>
                <RecognitionWrapper isDisplay={recognitionText.length > 0}>
                  <Title>Your Speech:</Title>
                  <DownloadBtn className={'fa fa-cloud-download'} onClick={this.downloadAudio} />
                  <WaveSurferTableWrapper>
                    <tbody>
                    <tr>
                      <WaveSurferContainer ref={this.waveSurferRef} />
                      <WaveSurferControlCol>
                        <PlayBtn className={waveIconClassName} onClick={this.playPauseWaveSurfer}/>
                      </WaveSurferControlCol>
                    </tr>
                    </tbody>
                  </WaveSurferTableWrapper>
                  <RecognitionTextWrapper>
                    {recognitionText}
                  </RecognitionTextWrapper>
                  <DiffTextWrapper>
                    <Title>Result:</Title>
                    {speechResult}
                  </DiffTextWrapper>
                </RecognitionWrapper>
                <LoadingIcon isDisplay={recognitionText.length === 0} />
              </SpeechResult>
            </RightBody>
          </Right>
        </Root>
      </PageLayout>
    );
  }
}

const mapStateToProps = (state: IStoreState) => ({
  word: state.word,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  searchWord(words: Array<string>) {
    dispatch(actionSearchWord(words));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(PageReadAloud);
