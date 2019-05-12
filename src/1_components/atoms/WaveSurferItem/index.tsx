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
  text-align: right;
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

interface Props {
  hidden?: boolean;
  audio?: string | Blob;
  className?: string;
}
interface State {
  isPlaying: boolean;
}

class WaveSurferItem extends React.Component<Props, State> {
  ref: RefObject<HTMLTableCellElement>;
  waveSurfer: WaveSurfer | undefined;

  constructor(props: Props, context: any) {
    super(props, context);
    this.ref = React.createRef();

    this.state = {
      isPlaying: false,
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
    }
  }

  componentDidUpdate({ audio: prevAudio }: Readonly<Props>): void {
    const { audio }: Props = this.props;
    if (this.waveSurfer && audio && prevAudio !== audio) {
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
    const { isPlaying } = this.state;
    const waveIconClassName = `fa ${isPlaying ? 'fa-pause' : 'fa-play'}`;

    return (
      <Root isDisplay={!hidden && !!audio}>
        <Table>
          <tbody>
            <tr>
              <WaveSurferContainer ref={this.ref} />
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
