import React, { ReactNode } from 'react';
import * as _ from 'lodash-es';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getEWordClassString, getLocalString, IPronunciation, IWord, MPTypes } from 'myprodict-model/lib-esm';

import IconWithSpinner, { IconType } from '^/1_components/atoms/IconWithSpinner';

import { colors } from '^/theme';

interface RootProps {
  isActive?: boolean;
}
const Root = styled.div<RootProps>`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: .6rem .5rem;
  min-height: 4.5rem;
  word-wrap: break-word;
  border: 1px solid ${colors.borderGray.alpha(.5).toString()};
  background-clip: border-box;
  background-color: ${({ isActive }) => isActive && colors.bgHighlight.toString()};
  
  :hover {
    h3 {
      color: ${colors.green.toString()};
    }
  }
`;
const WordLink = styled(Link)`
  position: absolute;
  top: 0;
  right: 0;
  font-size: .5rem;
  color: ${colors.grey.toString()}
`;
const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
`;
const PronunciationTable = styled.table`
  padding-left: 2rem;
  border: none;
`;
const PronunciationTableRow = styled.tr`
  >td {
    border-top: dotted 1px ${colors.borderGray.alpha(.5).toString()};
  }
  
  :first-child {
    >td {
      border-top: none;
    }
  }
`;
const PronunciationTableLocal = styled.td`
  width: 1.7rem;
  font-size: .9rem;
  color: ${colors.grey.alpha(.8).toString()};
  padding-top: .25rem;
`;
const PronunciationTableTranscript = styled.td``;
const Transcript = styled.div`
  position: relative;
  padding: .6rem 0;
  font-size: 1.1rem;
  font-weight: 400;
  color: ${colors.red.toString()};
`;
const TranscriptWordClass = styled.span`
  font-size: .8rem;
  font-style: italic;
  width: 1.5rem;
  display: inline-block;
  color: ${colors.grey.alpha(.8).toString()};
`;
const Speaker = styled(IconWithSpinner)`
  position: absolute;
  right: 0;
  top: .5rem;
  font-size: .9rem;
`;
const Footer = styled.div`
  font-size: .8rem;
  font-style: italic;
  color: ${colors.grey.alpha(.8).toString()};
  margin-top: .2rem;
`;

interface Props {
  word: IWord;
  prons: Array<IPronunciation>;
  isActive?: boolean;
  meaningNumber?: number;
  usageNumber?: number;
  isEditable?: boolean;
  link?: string;
  onSelectWord?(keyid: string, term: string): any;
}

interface State {
  loadingAudio?: string;
  pSystems: Array<MPTypes.PronunciationSystem>;
  selectedSystem: MPTypes.PronunciationSystem;
}

class Word extends React.Component<Props, State> {
  constructor(props: Props, context: any) {
    super(props, context);
    this.state = {
      loadingAudio: undefined,
      pSystems: [],
      selectedSystem: MPTypes.PronunciationSystem.IPA,
    };
  }

  componentDidMount() {
    this.setupPSystems(this.props.prons);
  }

  componentWillReceiveProps(nextProps: Props) {
    this.setupPSystems(nextProps.prons);
  }

  setupPSystems = (prons: IPronunciation[]) => {
    if (prons && prons.length > 0) {
      this.setState({pSystems: _.uniq(prons.map(p => p.value.system))});
    }
  };

  onClickSpeaker = (e: React.SyntheticEvent, word: string, local: string, transcript: IPronunciation) => {
    const url = transcript.value.sound_url ||
      `https://ssl.gstatic.com/dictionary/static/sounds/20160317/${word}--_${_.toLower(local)}_1.mp3`;
    new Audio(url).play()
      .then(() => {
        this.setState({loadingAudio: undefined});
      })
      .catch(err => {
        const msg = new SpeechSynthesisUtterance();
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(theVoice => theVoice.lang === `en-${local.toUpperCase()}`) || voices[0];
        // console.error('voice = ', voice);
        msg.voice = voice;
        msg.text = word;
        speechSynthesis.speak(msg);
        this.setState({loadingAudio: undefined});
      });
    this.setState({loadingAudio: transcript.keyid});
    e.stopPropagation();  // cancel its parent's onClick function
  };

  render() {
    const { word, prons, isActive, meaningNumber, usageNumber, isEditable, onSelectWord, link } = this.props;
    const { selectedSystem, loadingAudio} = this.state;

    const onWordClick = () => {
      if (onSelectWord) {
        onSelectWord(word.keyid, word.value.word);
      }
      console.log('link = ', link);
    };
    const sProns = prons.filter(p => p.value.system === selectedSystem) || [];
    const locals = _.uniq(sProns.map(p => p.value.local)).sort();

    const linkEdit: ReactNode = isEditable ? (
      <WordLink to={`/word/edit/${word.value.custom_url}`}>
        <i className={'fa fa-pencil-square-o'}/>
      </WordLink>
    ) : undefined;

    const localTranscripts: ReactNode = locals.map((local) => {
      const localLabel = getLocalString(local);
      const transcripts: ReactNode = sProns
        .filter(p => p.value.local === local)
        .map((transcript) => {
          const isLoading: boolean = loadingAudio === transcript.keyid;
          const onAudioClick = (
            e: React.SyntheticEvent,
          ) => this.onClickSpeaker(e, word.value.word, getLocalString(local), transcript);

          return (
            <Transcript key={transcript.keyid}>
              <TranscriptWordClass>
                {getEWordClassString(transcript.value.word_class)}
              </TranscriptWordClass>
              {transcript.value.transcript}
              <Speaker iconType={IconType.speaker} isLoading={isLoading} onClick={onAudioClick} />
            </Transcript>
          );
        });

      return (
        <PronunciationTableRow key={local}>
          <PronunciationTableLocal>
            {localLabel}
          </PronunciationTableLocal>
          <PronunciationTableTranscript>
            {transcripts}
          </PronunciationTableTranscript>
        </PronunciationTableRow>
      );
    });

    const meaning = meaningNumber && meaningNumber > 0 ?
      `${meaningNumber} mean${meaningNumber > 1 ? 's' : ''}` : undefined;
    const usage = usageNumber && usageNumber > 0 ?
      `${meaning ? ', ' : ''}${usageNumber} usage${usageNumber > 1 ? 's' : ''}` : undefined;

    return (
      <Root isActive={isActive} onClick={onWordClick}>
        {linkEdit}
        <Title>
          {word.value.word}
        </Title>
        <PronunciationTable>
          <tbody>
            {localTranscripts}
          </tbody>
        </PronunciationTable>
        <Footer>
          {meaning}{usage}
        </Footer>
      </Root>
    );
  }
}

export default Word;
