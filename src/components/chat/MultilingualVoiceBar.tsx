import React, { useState, useEffect } from 'react';

import {
  Volume2,
  Pause,
  Play,
  Square,
  AlertCircle,
  Globe,
  Mic
} from 'lucide-react';

import {
  useLanguage
} from '../../context/LanguageContext';

import {
  SUPPORTED_LANGUAGES,
  SupportedLanguageCode
} from '../../config/languageConfig';

import {
  textToSpeechService
} from '../../services/textToSpeechService';

import {
  translateExplanationText
} from '../../services/translationService';

import './MultilingualVoiceBar.css';


interface MultilingualVoiceBarProps {
  lastResponseText?: string;
}


export const MultilingualVoiceBar:
  React.FC<MultilingualVoiceBarProps> = ({
    lastResponseText
  }) => {

  const {
    currentLanguage,
    setLanguage,

    autoSpeak,
    setAutoSpeak,

    voiceGender,
    setVoiceGender
  } = useLanguage();


  const [
    availableVoices,
    setAvailableVoices
  ] = useState<
    SpeechSynthesisVoice[]
  >([]);


  const [
    isPlaying,
    setIsPlaying
  ] = useState(false);


  const [
    isPaused,
    setIsPaused
  ] = useState(false);


  const [
    voiceUnavailableWarning,
    setVoiceUnavailableWarning
  ] = useState<
    string | null
  >(null);


  /*
   * Load voices when language changes.
   */
  useEffect(() => {

    const updateVoices = () => {

      const voices =
        textToSpeechService
          .getVoicesForLanguage(
            currentLanguage
          );

      setAvailableVoices(voices);


      const hasVoice =
        textToSpeechService
          .hasVoiceForLanguage(
            currentLanguage
          );


      const langConfig =
        SUPPORTED_LANGUAGES[
          currentLanguage
        ];


      if (!hasVoice) {

        setVoiceUnavailableWarning(
          `${langConfig.displayName} text response ready. (${langConfig.displayName} voice playback is not available on this device).`
        );

      } else {

        setVoiceUnavailableWarning(
          null
        );
      }
    };


    updateVoices();


    if (
      typeof window !==
        'undefined' &&
      'speechSynthesis' in
        window
    ) {

      window.speechSynthesis
        .onvoiceschanged =
          updateVoices;
    }


  }, [currentLanguage]);


  /*
   * Language changed.
   */
  const handleLanguageChange = (
    e: React.ChangeEvent<
      HTMLSelectElement
    >
  ) => {

    const newLang =
      e.target.value as
        SupportedLanguageCode;


    setLanguage(
      newLang
    );


    textToSpeechService.stop();


    setIsPlaying(
      false
    );


    setIsPaused(
      false
    );
  };


  /*
   * Female / Male voice changed.
   */
  const handleVoiceGenderChange = (
    e: React.ChangeEvent<
      HTMLSelectElement
    >
  ) => {

    setVoiceGender(
      e.target.value as
        'female' | 'male'
    );

    /*
     * Stop current speech
     * when changing voice.
     */
    textToSpeechService.stop();

    setIsPlaying(
      false
    );

    setIsPaused(
      false
    );
  };


  /*
   * Listen button.
   */
  const handleListenClick = async () => {

  if (!lastResponseText) {
    return;
  }

  const langConfig =
    SUPPORTED_LANGUAGES[currentLanguage];

  const hasVoice =
    textToSpeechService.hasVoiceForLanguage(
      currentLanguage
    );

  if (!hasVoice) {
    setVoiceUnavailableWarning(
      `${langConfig.displayName} voice playback is not available.`
    );
    return;
  }

  setIsPlaying(true);
  setIsPaused(false);
  setVoiceUnavailableWarning(null);

  try {

    /*
     * Translate the existing response first.
     * The translated text is then sent to TTS.
     */
    const translatedText =
      await translateExplanationText(
        lastResponseText,
        currentLanguage
      );

    console.log(
      `Speaking response in ${currentLanguage}:`,
      translatedText
    );

    textToSpeechService.speak(
      translatedText,
      currentLanguage,
      voiceGender,

      () => {
        setIsPlaying(false);
        setIsPaused(false);
      },

      (err) => {
        console.warn(
          'TTS error:',
          err
        );

        setIsPlaying(false);
        setIsPaused(false);
      },

      (unavailLang) => {

        const langName =
          SUPPORTED_LANGUAGES[
            unavailLang
          ].displayName;

        setVoiceUnavailableWarning(
          `${langName} voice playback is not available.`
        );

        setIsPlaying(false);
        setIsPaused(false);
      }
    );

  } catch (error) {

    console.error(
      'Translation before speech failed:',
      error
    );

    setIsPlaying(false);
    setIsPaused(false);

    setVoiceUnavailableWarning(
      `${langConfig.displayName} translation failed.`
    );
  }
};



  const handlePauseClick =
    () => {

    textToSpeechService.pause();

    setIsPaused(
      true
    );
  };


  const handleResumeClick =
    () => {

    textToSpeechService.resume();

    setIsPaused(
      false
    );
  };


  const handleStopClick =
    () => {

    textToSpeechService.stop();

    setIsPlaying(
      false
    );

    setIsPaused(
      false
    );
  };


  return (

    <div
      className="
        multilingual-voice-bar
        glass-card
      "
    >

      <div
        className="
          voice-bar-top-row
        "
      >


        {/* Language Selector */}

        <div
          className="
            control-group
          "
        >

          <label
            className="
              control-label
            "
          >

            <Globe
              size={14}
              className="
                icon-cyan
              "
            />

            Language:

          </label>


          <select
            className="
              voice-select-field
            "

            value={
              currentLanguage
            }

            onChange={
              handleLanguageChange
            }
          >

            {
              (
                Object.keys(
                  SUPPORTED_LANGUAGES
                ) as
                  SupportedLanguageCode[]
              ).map(
                (
                  code
                ) => {

                  const lang =
                    SUPPORTED_LANGUAGES[
                      code
                    ];

                  return (

                    <option
                      key={code}
                      value={code}
                    >

                      {lang.flagEmoji}

                      {' '}

                      {lang.displayName}

                      {' ('}

                      {lang.nativeName}

                      {')'}

                    </option>
                  );
                }
              )
            }

          </select>

        </div>


        {/* Female / Male Selector */}

        <div
          className="
            control-group
          "
        >

          <label
            className="
              control-label
            "
          >

            <Mic
              size={14}
              className="
                icon-violet
              "
            />

            Voice:

          </label>


          <select
            className="
              voice-select-field
            "

            value={
              voiceGender
            }

            onChange={
              handleVoiceGenderChange
            }
          >

            <option
              value="female"
            >
              Female
            </option>


            <option
              value="male"
            >
              Male
            </option>

          </select>

        </div>


        {/* Auto Speak */}

        <div
          className="
            control-group
            auto-speak-group
          "
        >

          <span
            className="
              control-label
            "
          >
            Auto Speak:
          </span>


          <button
            type="button"

            className={
              `
              btn-toggle-auto-speak
              ${
                autoSpeak
                  ? 'active'
                  : ''
              }
              `
            }

            onClick={
              () =>
                setAutoSpeak(
                  !autoSpeak
                )
            }
          >

            {
              autoSpeak
                ? 'ON'
                : 'OFF'
            }

          </button>

        </div>

      </div>


      {/* Playback Controls */}

      <div
        className="
          voice-bar-playback-row
        "
      >

        <div
          className="
            playback-btn-group
          "
        >


          {
            !isPlaying ? (

              <button
                type="button"

                className="
                  btn
                  btn-primary
                  btn-sm
                  btn-playback
                "

                onClick={
                  handleListenClick
                }

                disabled={
                  !lastResponseText
                }
              >

                <Volume2
                  size={15}
                />

                <span>
                  🔊 Listen
                </span>

              </button>

            ) : isPaused ? (

              <button
                type="button"

                className="
                  btn
                  btn-secondary
                  btn-sm
                  btn-playback
                "

                onClick={
                  handleResumeClick
                }
              >

                <Play
                  size={15}
                  className="
                    icon-emerald
                  "
                />

                <span>
                  ▶ Resume
                </span>

              </button>

            ) : (

              <button
                type="button"

                className="
                  btn
                  btn-secondary
                  btn-sm
                  btn-playback
                "

                onClick={
                  handlePauseClick
                }
              >

                <Pause
                  size={15}
                  className="
                    icon-amber
                  "
                />

                <span>
                  ⏸ Pause
                </span>

              </button>

            )
          }


          <button
            type="button"

            className="
              btn
              btn-secondary
              btn-sm
              btn-playback
            "

            onClick={
              handleStopClick
            }

            disabled={
              !isPlaying &&
              !isPaused
            }
          >

            <Square
              size={14}
              className="
                icon-rose
              "
            />

            <span>
              ⏹ Stop
            </span>

          </button>

        </div>


        {
          isPlaying &&
          !isPaused && (

            <div
              className="
                voice-speaking-indicator
              "
            >

              <span
                className="
                  speaking-wave
                "
              />

              <span>

                AI Speaking response in

                {' '}

                {
                  SUPPORTED_LANGUAGES[
                    currentLanguage
                  ].displayName
                }

                ...

              </span>

            </div>
          )
        }

      </div>


      {/* Voice unavailable warning */}

      {
        voiceUnavailableWarning && (

          <div
            className="
              voice-unavailable-toast
            "
          >

            <AlertCircle
              size={15}

              className="
                icon-amber
              "

              style={{
                flexShrink: 0
              }}
            />

            <span>
              {
                voiceUnavailableWarning
              }
            </span>

          </div>
        )
      }

    </div>
  );
};
