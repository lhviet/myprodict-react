import React, { ReactNode, RefObject } from 'react';
import { Action, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { capitalize } from 'lodash-es';
import axios from 'axios';
import moment from 'moment';
import WaveSurfer from 'wavesurfer.js';
import * as Diff from 'diff';
import styled from 'styled-components';

import { IStoreState } from '^/types';
import { HOST } from '^/app-configs';
import { colors, styles } from '^/theme';

import RecordingBtn from '^/1_components/atoms/RecordingBtn';
import ListSearchWord from '^/2_containers/components/ListSearchWord';
import { actionSearchWord, IWordState } from '^/3_store/ducks/word';

import PageLayout from '../_PageLayout';

const Root = styled.div`
  position: relative;
  height: calc(100vh - 3rem);
  overflow: hidden;
`;
const Left = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 30%;
  max-width: 300px;
  background-color: #fff;
  border-right: solid 1px ${colors.borderGray.toString()};
`;
const Right = styled.div`
  margin-left: 30%;
  height: 100%;
  padding: 1rem;
  
  transition: all ease .1s;
  overflow-y: auto;
  overscroll-behavior: contain;
  ${styles.scrollbar};
`;
const TextArea = styled.textarea.attrs({
  placeholder: 'Paste or type the sentences you want to practice here.',
  rows: 6,
})`
  width: 100%;
  font-size: 1.5rem;
`;
const Title = styled.label`
  font-weight: 600;
  color: ${colors.dark.alpha(.8).toString()};
`;
const RecognitionWrapper = styled.div`
  position: relative;
  background-color: #fff;
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding: .5rem;
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
  color: ${colors.dark.alpha(.9).toString()};
`;
const DiffTextWrapper = styled.div`
  background-color: #fff;
  font-size: 1.1rem;
  padding: .5rem;
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
  color: ${colors.grey.alpha(.8).toString()};
  
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
  color: ${colors.grey.alpha(.6).toString()};
  :hover {
    color: ${colors.grey.toString()};
  }
`;

interface Props {
  word: IWordState;
  searchWord(words: Array<string>): any;
}
interface State {
  isRecording: boolean;
  isMicAvailable: boolean;
  isPlaying: boolean;
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
      this.speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        finalTranscript = capitalize(finalTranscript);
        const diffWords = Diff.diffWords(this.state.sampleText, finalTranscript, { ignoreCase: true });
        const missingWords = diffWords
          .filter(word => word.removed)
          .map(word => word.value);
        this.props.searchWord(missingWords);
        this.setState({ recognitionText: finalTranscript, diffWords });
      };
    } else {
      console.error('SpeechRecognition is not available on this browser.');
    }

    this.state = {
      isMicAvailable: true,
      isRecording: false,
      isPlaying: false,
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

  startRecording = () => {
    if (!this.state.isRecording) {
      navigator.mediaDevices.getUserMedia({audio: true})
        .then((stream) => {
          this.mediaRecorder = new MediaRecorder(stream);
          this.mediaRecorder.ondataavailable = (event: BlobEvent) => this.audioChunks.push(event.data);
          this.mediaRecorder.onstart = () => {
            this.audioChunks = [];
            this.setState({isRecording: true});
          };
          this.mediaRecorder.onstop = () => {
            this.audioBlob = new Blob(this.audioChunks, {type: 'audio/mpeg-3'});
            if (this.waveSurfer) {
              this.waveSurfer.load(URL.createObjectURL(this.audioBlob));
            }
            this.setState({isRecording: false});
          };
          this.mediaRecorder.start();

          this.setState({isMicAvailable: true});
        })
        .catch(err => {
          console.error('Microphone is not available.');
          this.setState({isMicAvailable: false});
        });

      if (this.speechRecognition) {
        this.speechRecognition.start();
      }
      this.setState({ isRecording: true });
    }
  }
  stopRecording = () => {
    if (this.state.isRecording) {
      if (this.mediaRecorder) {
        this.mediaRecorder.stop();
        this.mediaRecorder.stream.getTracks().forEach(t => t.stop());
      }
      if (this.speechRecognition) {
        this.speechRecognition.stop();
      }
      this.setState({ isRecording: false });
    }
  }

  handleTextChange = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    this.setState({sampleText: event.currentTarget.value});
  }

  playPauseWaveSurfer = () => {
    if (this.waveSurfer) {
      this.waveSurfer.playPause();
      this.setState((prevState) => ({ isPlaying: !prevState.isPlaying }));
    }
  }

  render() {
    const {
      isMicAvailable, isRecording, isPlaying, sampleText, recognitionText, diffWords,
    }: State = this.state;

    const downloadAudio = () => {
      if (this.audioBlob) {
        const timestamp: string = moment().format('HHmm-DDMMYYYY');
        const audioUrl: string = URL.createObjectURL(this.audioBlob);
        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = `ra-${timestamp}.mp3`;
        a.click();
        window.URL.revokeObjectURL(audioUrl);
      }
    };

    const onRecording = () => {
      if (isRecording) {
        this.stopRecording();
      } else if (isMicAvailable) {
        this.startRecording();
      }
    }

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
            <TextArea onChange={this.handleTextChange}>{sampleText}</TextArea>

            <RecordingBtn
              isRecording={isRecording}
              isMicAvailable={isMicAvailable}
              countdown={3}
              onClick={onRecording}
            />

            <RecognitionWrapper>
              <Title>Your Speech:</Title>
              <DownloadBtn className={'fa fa-cloud-download'} onClick={downloadAudio} />
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
            </RecognitionWrapper>

            <DiffTextWrapper>
              <Title>Result:</Title>
              {speechResult}
            </DiffTextWrapper>
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
