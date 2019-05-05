import React, { ReactNode, RefObject } from 'react';
import { Action, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { capitalize } from 'lodash-es';
import axios from 'axios';
import moment from 'moment';
import WaveSurfer from 'wavesurfer.js';
import * as Diff from 'diff';
import { IWord } from 'myprodict-model/lib-esm';
import styled from 'styled-components';

import { IStoreState } from '^/types';
import { HOST } from '^/app-configs';

import Word from '^/1_components/atoms/Word';
import { IWordState, actionSearchMatchWordStart } from '^/3_store/ducks/word';
import PageLayout from '../_PageLayout';

import { colors } from '^/theme';

const Root = styled.div`
  position: relative;
  width: 80%;
  max-width: 800px;
  min-width: 300px;
  margin: 0 auto;
  padding: 1rem .5rem;
`;
const TextArea = styled.textarea.attrs({
  placeholder: 'Paste or type the sentences you want to practice here.',
  rows: 4,
})`
  width: 100%;
`;
const WaveSurferTableWrapper = styled.table`
  position: relative;
  background-color: white;
  border: none;
  width: 100%;
`;
const WaveSurferControlCol = styled.td`
  width: 20%;
`;
const WaveSurferContainer = styled.td`
  width: 80%;
`;
const RecognitionTextWrapper = styled.div`
  background-color: white;
`;
const DiffTextWrapper = styled.div`
  background-color: white;
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
const MicBtn = styled.i`
  font-size: 2rem;
  width: 2.4rem;
  height: 2.4rem;
  text-align: center;    
  cursor: pointer;
  padding: 0.1rem;
  border: solid 1px transparent;
  border-radius: 50%;
  color: ${colors.grey.alpha(.8).toString()};
`;
const PlayBtn = styled.i`
  font-size: 1rem;
  width: 1.1rem;
  height: 1.1rem;
  text-align: center;    
  cursor: pointer;
  padding: 0.1rem;
  border: solid 1px transparent;
  border-radius: 50%;
  color: ${colors.grey.alpha(.8).toString()};
`;

interface Props {
  word: IWordState;
  searchWord(words: Array<string>): any;
}
interface State {
  isSpeechAvailable: boolean;
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

  wavesurferRef: RefObject<HTMLTableCellElement>;
  wavesurfer: WaveSurfer | undefined;

  constructor(props: Props, context: any) {
    super(props, context);
    this.wavesurferRef = React.createRef();

    let isSpeechAvailable: boolean = true;

    if (!('webkitSpeechRecognition' in window)) {
      isSpeechAvailable = false;
    } else {
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
    }
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (event: BlobEvent) => this.audioChunks.push(event.data);
        this.mediaRecorder.onstart = () => {
          this.audioChunks = [];
          this.setState({ isRecording: true });
        };
        this.mediaRecorder.onstop = () => {
          this.audioBlob = new Blob(this.audioChunks, {type: 'audio/mpeg-3'});
          if (this.wavesurfer) {
            this.wavesurfer.load(URL.createObjectURL(this.audioBlob));
          }
          this.setState({ isRecording: false });
        };

        this.setState({ isMicAvailable: true });
      });

    this.state = {
      isSpeechAvailable,
      isMicAvailable: false,
      isRecording: false,
      isPlaying: false,
      sampleText: '',
      recognitionText: '',
      diffWords: [],
    };
  }

  componentDidMount(): void {
    this.wavesurfer = WaveSurfer.create({
      container: this.wavesurferRef.current as HTMLTableCellElement,
      waveColor: 'gray',
      progressColor: 'black',
      cursorColor: 'black',
      barHeight: 1.3,
      height: 60,
      hideScrollbar: true,
    });
    this.wavesurfer.on('finish', () => {
      if (this.wavesurfer) {
        this.wavesurfer.stop();
      }
      this.setState({ isPlaying: false });
    });
  }

  onStartRecording = () => {
    if (!this.state.isRecording) {
      if (this.mediaRecorder) {
        this.mediaRecorder.start();
      }
      if (this.speechRecognition) {
        this.speechRecognition.start();
      }
      this.setState({ isRecording: true });
    }
  }
  onStopRecording = () => {
    if (this.state.isRecording) {
      if (this.mediaRecorder) {
        this.mediaRecorder.stop();
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
    if (this.wavesurfer) {
      this.wavesurfer.playPause();
      this.setState((prevState) => ({ isPlaying: !prevState.isPlaying }));
    }
  }

  render() {
    const {
      isMicAvailable, isSpeechAvailable, isRecording, isPlaying, sampleText, recognitionText, diffWords,
    }: State = this.state;
    const playAudio = () => {
      if (this.audioBlob) {
        const audioUrl: string = URL.createObjectURL(this.audioBlob);
        const audio = new Audio(audioUrl);
        audio.play().then(() => console.log('Play recorded audio now ~~~'));

        const bodyFormData = new FormData();
        bodyFormData.set('data', this.audioBlob);
        axios.post(HOST.api.getUrl('/api/speech'), bodyFormData);
      }
    };
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

    const microphoneIcon: ReactNode = isSpeechAvailable ? (
      isRecording ? (
        <MicBtn className={'fa fa-microphone an-pulse-btn'} onClick={this.onStopRecording} />
      ) : (
        <MicBtn className={'fa fa-microphone'} onClick={this.onStartRecording} />
      )
    ) : (
      <MicBtn className={'fa fa-microphone-slash'} />
    );

    const waveIconClassName: string = `fa ${isPlaying ? 'fa-pause' : 'fa-play'}`;

    const words: IWord[] = this.props.word.readAloudWords || [];

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
          <TextArea onChange={this.handleTextChange}>{sampleText}</TextArea>

          <div>
            <button className={'btn btn-primary'} onClick={playAudio}>Save</button>
            <button className={'btn btn-primary'} onClick={downloadAudio}>Download</button>
            {microphoneIcon}
          </div>

          <WaveSurferTableWrapper>
            <tbody>
              <tr>
                <WaveSurferControlCol>
                  <PlayBtn className={waveIconClassName} onClick={this.playPauseWaveSurfer}/>
                </WaveSurferControlCol>
                <WaveSurferContainer ref={this.wavesurferRef} />
              </tr>
            </tbody>
          </WaveSurferTableWrapper>

          <RecognitionTextWrapper>
            <div><b>Your Speech:</b></div>
            {recognitionText}
          </RecognitionTextWrapper>

          <DiffTextWrapper>
            <div><b>Diff Text:</b></div>
            {speechResult}
          </DiffTextWrapper>

          <hr />
          <b>Incorrect words:</b>
          {words.map((model: IWord) => {
            return <div key={model.keyid} className={'mb-3 word'}>
              <Word
                word={model}
                prons={[]}
                isActive={false}
                meaningNumber={0}
                usageNumber={0}
                onSelectWord={() => console.log('onSelectWord')}
                link={`/word/${model.value.custom_url}`}
              />
            </div>;
          })}
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
    dispatch(actionSearchMatchWordStart(words));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(PageReadAloud);
