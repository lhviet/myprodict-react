import React, { ReactNode, RefObject } from 'react';
import { connect } from 'react-redux';
import { capitalize } from 'lodash-es';
import axios from 'axios';
import moment from 'moment';
import WaveSurfer from 'wavesurfer.js';
import Diff from 'diff';

import { IStoreState } from '^/types';
import { HOST } from '^/app-configs';

import PageLayout from '../_PageLayout';

import styles from './styles.module.scss';

interface Props {
}

interface State {
  isSpeechAvailable: boolean;
  isRecording: boolean;
  isMicAvailable: boolean;
  sampleText: string;
  recognitionText: string;
  diffText: string;
  missingWords: Array<string>;
}

class PageReadAloud extends React.Component<Props, State> {
  audioChunks: any[] = [];
  mediaRecorder: MediaRecorder | undefined;
  audioBlob: Blob | undefined;
  speechRecognition: SpeechRecognition | undefined;

  wavesurferRef: RefObject<HTMLDivElement>;
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
        let diffText: string = '';
        const missingWords: Array<string> = [];
        diffWords.forEach((word: Diff.Change) => {
          diffText += word.added ? `<u>${word.value}</u>` :
            (word.removed ? `<b>${word.value}</b>` : word.value) + ' ';
          if (word.removed) {
            missingWords.push(word.value);
          }
        });
        diffText = diffText.trim();
        console.log('diff = ', diffWords);
        console.log('diffText = ', diffText);
        this.setState({ recognitionText: finalTranscript, diffText, missingWords });
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
      sampleText: '',
      recognitionText: '',
      diffText: '',
      missingWords: [],
    };
  }

  componentDidMount(): void {
    console.log('wave element = ', this.wavesurferRef.current);
    this.wavesurfer = WaveSurfer.create({
      container: this.wavesurferRef.current as HTMLDivElement,
      waveColor: 'gray',
      progressColor: 'black',
      cursorColor: 'black'
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

  render() {
    const {
      isMicAvailable, isSpeechAvailable, isRecording, sampleText, recognitionText, diffText, missingWords,
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
        <i
          className={'fa fa-microphone fa-2x text-muted an-pulse-btn ' + styles.micBtn}
          onClick={this.onStopRecording}
        />
      ) : (
        <i className={'fa fa-microphone fa-2x'} onClick={this.onStartRecording} />
      )
    ) : (
      <i className={'fa fa-microphone-slash fa-2x'} />
    );
    return (
      <PageLayout>
        <div className={styles.pageReadAloud}>
          <textarea style={{width: '100%', height: '250px'}} onChange={this.handleTextChange} >
            {sampleText}
          </textarea>
        </div>
        <div className={'text-right'}>
          <button className={'btn btn-primary'} onClick={playAudio}>Save</button>
          <button className={'btn btn-primary'} onClick={downloadAudio}>Download</button>
          {microphoneIcon}
        </div>

        <div ref={this.wavesurferRef} />

        Your Recognized Speech:
        <div>{recognitionText}</div>

        Diff Text
        <div dangerouslySetInnerHTML={{__html: diffText}} />

        <hr />
        <b>The words you pronounced incorrectly:</b>
        <div>{missingWords.toString()}</div>
      </PageLayout>
    );
  }
}

const mapStateToProps = (state: IStoreState) => ({
});

const mapDispatchToProps = () => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(PageReadAloud);
