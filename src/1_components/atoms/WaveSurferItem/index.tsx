import * as _ from 'lodash-es';
import React, { RefObject } from 'react';
import styled from 'styled-components';
import WaveSurfer from 'wavesurfer.js';

import { colors } from '^/theme';

const alpha8 = .8;
const waveSurferHeight = 60;

interface RootProps {
  isDisplay?: boolean;
}
const Root = styled.div<RootProps>`
  border: none;
  width: 100%;
  height: ${props => props.isDisplay ? `${waveSurferHeight}px` : 0};
  overflow: hidden;
  transition: height ease .1s;
`;
const Table = styled.table`
  width: 100%;
`;
const WaveSurferControlCol = styled.td`
  width: 1.5rem;
  text-align: center;
`;
const WaveSurferContainer = styled.td`
  width: auto;
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
const PlayInfo = styled.div`
  font-size: .8rem;
  line-height: 1.3rem;
  color: ${colors.grey.alpha(alpha8).toString()};
`;

interface Props {
  hidden?: boolean;
  audio?: string | Blob;
  className?: string;
}
interface State {
  isPlaying: boolean;
  currentTime: number;
}
class WaveSurferItem extends React.Component<Props, State> {
  ref: RefObject<HTMLTableCellElement>;
  waveSurfer: WaveSurfer | undefined;

  constructor(props: Props, context: any) {
    super(props, context);
    this.ref = React.createRef();

    this.state = {
      isPlaying: false,
      currentTime: 0,
    };
  }

  componentDidMount(): void {
    if (this.ref.current && !this.waveSurfer) {
      this.waveSurfer = WaveSurfer.create({
        container: this.ref.current,
        waveColor: 'gray',
        progressColor: 'black',
        cursorColor: 'black',
        barHeight: 1.3,
        height: waveSurferHeight,
        hideScrollbar: true,
      });
      this.waveSurfer.on('finish', () => {
        if (this.waveSurfer) {
          this.waveSurfer.stop();
        }
        this.setState({ isPlaying: false });
      });
      this.waveSurfer.on('audioprocess', () => {
        this.setState({ currentTime: this.waveSurfer ? this.waveSurfer.getCurrentTime() : 0 });
      });
      this.loadAudio();
    }
  }

  componentDidUpdate({ audio: prevAudio }: Readonly<Props>): void {
    const { audio }: Props = this.props;
    const prevAudioType: string = typeof prevAudio;
    const audioType: string = typeof audio;
    if (prevAudioType !== audioType) {
      this.loadAudio();
    } else if (audio && prevAudio) {
      if (audioType === 'string') {
        if (audio !== prevAudio) {
          this.loadAudio();
        }
      } else if ((audio as Blob).size !== (prevAudio as Blob).size) {
        this.loadAudio();
      }
    }
  }

  loadAudio() {
    const { audio } = this.props;
    if (this.waveSurfer && audio) {
      if (typeof audio === 'string') {
        this.waveSurfer.load(audio);
      } else {
        this.waveSurfer.loadBlob(audio);
      }
    }
  }

  playPauseWaveSurfer = () => {
    if (this.waveSurfer) {
      this.waveSurfer.playPause();
      this.setState((prevState) => ({ isPlaying: !prevState.isPlaying }));
    }
  }

  render() {
    const { hidden, audio } = this.props;
    const { isPlaying, currentTime } = this.state;
    const waveIconClassName = `fa ${isPlaying ? 'fa-pause' : 'fa-play'}`;

    const precision = 1;
    let current = _.round(currentTime, precision);
    let duration = this.waveSurfer ? _.round(this.waveSurfer.getDuration(), precision) : 0.00;

    return (
      <Root isDisplay={!hidden && !!audio}>
        <Table>
          <tbody>
            <tr>
              <WaveSurferContainer ref={this.ref} />
              <WaveSurferControlCol>
                <PlayInfo>{current}s</PlayInfo>
                <PlayInfo>{duration}s</PlayInfo>
              </WaveSurferControlCol>
              <WaveSurferControlCol>
                <PlayBtn className={waveIconClassName} onClick={this.playPauseWaveSurfer}/>
              </WaveSurferControlCol>
            </tr>
          </tbody>
        </Table>
      </Root>
    );
  }
}

export default WaveSurferItem;
