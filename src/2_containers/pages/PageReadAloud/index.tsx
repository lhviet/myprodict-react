import * as React from 'react';
import { connect } from 'react-redux';

import { IStoreState } from '^/types';

import PageLayout from '../_PageLayout';

import styles from './styles.module.scss';
import axios from 'axios';
import {HOST} from '^/app-configs';

interface Props {
}

interface State {
  isRecording: boolean;
  isMicAvailable: boolean;
}

class PageReadAloud extends React.Component<Props, State> {
  audioChunks: any[] = [];
  mediaRecorder: MediaRecorder | undefined;
  audioBlob: Blob | undefined;

  constructor(props: Props, context: any) {
    super(props, context);

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = this.onRecorderDataAvailable;
        this.mediaRecorder.onstart = this.onRecorderStart;
        this.mediaRecorder.onstop = this.onRecorderStop;
        this.setState({ isMicAvailable: true });
      });

    this.state = {
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
    if (this.mediaRecorder && !this.state.isRecording) {
      this.mediaRecorder.start();
    }
  }
  onStopRecording = () => {
    if (this.mediaRecorder && this.state.isRecording) {
      this.mediaRecorder.stop();
    }
  }

  render() {
    const { isMicAvailable, isRecording }: State = this.state;
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

    const microphoneIcon: React.ReactNode = isMicAvailable ? (
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
          <textarea>
            Something inside the textarea here...
          </textarea>
          {microphoneIcon}
          <button className={'btn btn-primary'} onClick={playAudio}>Save</button>
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
