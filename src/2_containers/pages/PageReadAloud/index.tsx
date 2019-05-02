import * as React from 'react';
import { connect } from 'react-redux';
import { capitalize } from 'lodash-es';
import axios from 'axios';

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
}

class PageReadAloud extends React.Component<Props, State> {
  audioChunks: any[] = [];
  mediaRecorder: MediaRecorder | undefined;
  audioBlob: Blob | undefined;
  speechRecognition: SpeechRecognition | undefined;

  constructor(props: Props, context: any) {
    super(props, context);

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
        console.log('finalTranscript = ', finalTranscript);
      };
    }
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = this.onRecorderDataAvailable;
        this.mediaRecorder.onstart = this.onRecorderStart;
        this.mediaRecorder.onstop = this.onRecorderStop;
        this.setState({ isMicAvailable: true });
      });

    this.state = {
      isSpeechAvailable: true,
      isMicAvailable: false,
      isRecording: false,
    };
  }

  onRecorderDataAvailable = (event: BlobEvent) => this.audioChunks.push(event.data);
  onRecorderStart = () => {
    this.audioChunks = [];
    this.setState({ isRecording: true });
  }
  onRecorderStop = () => {
    this.audioBlob = new Blob(this.audioChunks, {type: 'audio/mpeg-3'});
    this.setState({ isRecording: false });
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

  render() {
    const { isMicAvailable, isSpeechAvailable, isRecording }: State = this.state;
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
        const audioUrl: string = URL.createObjectURL(this.audioBlob);
        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = `read-aloud-${new Date()}.mp3`;
        a.click();
        window.URL.revokeObjectURL(audioUrl);
      }
    };

    const microphoneIcon: React.ReactNode = isSpeechAvailable ? (
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
          <textarea style={{width: '100%', height: '250px'}}>
            Therefore, the working unions in modern society are not very important. They preserve their functions only in the underdeveloped countries. On the contrary, in the developed states, workers refuse to join the unions, preferring individual work. Thus, working unions cannot survive the assault of modern economic trends and slowly move to a complete decline. Their initial purposes have little to do with the hectic pace of modern life.
          </textarea>
        </div>
        <div className={'text-right'}>
          <button className={'btn btn-primary'} onClick={playAudio}>Save</button>
          <button className={'btn btn-primary'} onClick={downloadAudio}>Download</button>
          {microphoneIcon}
        </div>
      </PageLayout>
    );
  }
}

const mapStateToProps = (state: IStoreState) => ({
});

const mapDispatchToProps = () => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(PageReadAloud);
