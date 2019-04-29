import * as React from 'react';
import * as _ from 'lodash-es';
import { Link } from 'react-router-dom';

import {
  MPTypes, IWord, IPronunciation, getEWordClassString, getPronunciationSystemString, getLocalString
} from 'myprodict-model/lib-esm';

import style from './style.module.scss';

interface WordProps {
  word: IWord;
  prons: IPronunciation[];
  isActive?: boolean;
  meaningNumber?: number;
  usageNumber?: number;
  isEditable?: boolean;
  link?: string;
  onSelectWord?(keyid: string, term: string): any;
}

interface WordState {
  isLoadingAudio: boolean;
  pSystems: MPTypes.PronunciationSystem[];
}

class Word extends React.Component<WordProps, WordState> {
  constructor(props: WordProps, context: any) {
    super(props, context);
    this.state = {
      isLoadingAudio: false,
      pSystems: [],
    };
  }

  componentDidMount() {
    this.setupPSystems(this.props.prons);
  }

  componentWillReceiveProps(nextProps: WordProps) {
    this.setupPSystems(nextProps.prons);
  }

  setupPSystems = (prons: IPronunciation[]) => {
    if (prons && prons.length > 0) {
      this.setState({pSystems: _.uniq(prons.map(p => p.value.system))});
    }
  }

  onClickSpeaker = (e: React.SyntheticEvent<HTMLElement>, word: string, local: string, soundUrl: string) => {

    e.stopPropagation();  // cancel its parent's onClick function

    this.setState({isLoadingAudio: true});
    const url = soundUrl ||
      `https://ssl.gstatic.com/dictionary/static/sounds/20160317/${word}--_${local.toLowerCase()}_1.mp3`;
    new Audio(url).play()
      .then(() => {
        this.setState({isLoadingAudio: false});
      })
      .catch(err => {
        const msg = new SpeechSynthesisUtterance();
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(theVoice => theVoice.lang === `en-${local.toUpperCase()}`) || voices[0];
        // console.error('voice = ', voice);
        msg.voice = voice;
        msg.text = word;
        speechSynthesis.speak(msg);
        this.setState({isLoadingAudio: false});
      });
  }

  render() {
    const {word, prons, isActive, meaningNumber, usageNumber, isEditable, onSelectWord, link } = this.props;
    const {pSystems} = this.state;

    return (
      <div
        className={'card ' + (isActive && 'active ') + style.Word}
        onClick={() => onSelectWord && onSelectWord(word.keyid, word.value.word)}
      >
        {link && <Link
          to={link}
          className={'fs-d8e opa-7 pos-a t-0 r-0 p-1'}
          style={{zIndex: 110}}
        >
          <i className={'fa fa-chevron-right'}/>
        </Link>}
        <div className="card-body p-2 pr-0 py-sm-0 pl-sm-2">
          <div className="row no-gutters">
            <div className="col-12 col-sm-4 d-flex flex-column align-self-center">
              <h5 className="card-title mb-0">
                {isEditable && <Link to={'/word/edit/' + word.value.custom_url}>
                  <i className={'fa fa-pencil-square-o text-muted mr-2 fs-d8e'}/>
                </Link>}
                {word.value.word}
              </h5>
              {!!meaningNumber &&
              <div className={'fs-d8e text-muted'}>{meaningNumber} means</div>}
              {!!usageNumber &&
              <div className={'fs-d8e text-muted'}>{usageNumber} usages</div>}
            </div>
            {pSystems.map(system => {
              const sProns = prons.filter(p => p.value.system === system) || [];
              const locals = _.uniq(sProns.map(p => p.value.local)).sort();
              return <div key={system} className="col-12 col-sm-8">
                <div className={'text-muted text-right pt-1 pr-3 fs-d8e'}>{getPronunciationSystemString(system)}</div>
                <table className={'table border-0 mb-0 word-break-a'}>
                  <tbody>
                  {locals.map((local, index) =>
                    <tr key={index}>
                      <td className={'align-middle text-muted'}>{getLocalString(local)}</td>
                      <td>
                        {sProns.filter(p => p.value.local === local).map(item =>
                          <div key={item.keyid} className={'pos-r mb-1 pr-4'}>
                            <div>
                              <span className={'text-danger font-italic fs-1d3e'}>{item.value.transcript}</span>
                              <span className={'text-muted fs-d8e ml-3'}>
                              {getEWordClassString(item.value.word_class)}
                              </span>
                            </div>
                            <i
                              className={
                                'fa text-muted cursor-p pos-a t-d65 r-0' + (this.state.isLoadingAudio ?
                                  ' an-spin fa-spinner'
                                  : ' fa-volume-up')}
                              onClick={e => this.onClickSpeaker(
                                e, word.value.word, getLocalString(local), item.value.sound_url)}
                            />
                          </div>
                        )}
                      </td>
                    </tr>)}
                  </tbody>
                </table>
              </div>;
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default Word;
