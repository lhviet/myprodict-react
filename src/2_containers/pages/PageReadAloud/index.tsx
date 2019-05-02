import * as React from 'react';
import { connect } from 'react-redux';

import { IStoreState } from '^/types';

import PageLayout from '../_PageLayout';

import styles from './styles.module.scss';

interface Props {
}

interface State {
  isSpeechAvailable: boolean;
  isRecording: boolean;
}

class PagePronouncing extends React.Component<Props, State> {
  speechRecognition: SpeechRecognition | undefined;

  constructor(props: Props, context: any) {
    super(props, context);

    let isSpeechAvailable: boolean = true;

    if (!('webkitSpeechRecognition' in window)) {
      isSpeechAvailable = false;
    } else {
      this.speechRecognition = new webkitSpeechRecognition() as SpeechRecognition;
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
    }

    this.state = {
      isSpeechAvailable,
      isRecording: false,
    };
  }

  onStartRecording = () => {
    if (this.speechRecognition && !this.state.isRecording) {
      this.speechRecognition.start();
      this.setState({ isRecording: true });
    }
  }
  onStopRecording = () => {
    if (this.speechRecognition && this.state.isRecording) {
      this.speechRecognition.stop();
      this.setState({ isRecording: false });
    }
  }

  render() {
    const { isSpeechAvailable, isRecording }: State = this.state;
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
        <div className={styles.pagePronouncing}>
          <textarea>
            Something inside the textarea here...
          </textarea>
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

export default connect(mapStateToProps, mapDispatchToProps)(PagePronouncing);
