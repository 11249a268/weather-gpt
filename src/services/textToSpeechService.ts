import { SupportedLanguageCode } from '../config/languageConfig';

/**
 * WeatherGPT Multilingual Text-to-Speech Service
 *
 * Uses the WeatherGPT FastAPI backend.
 *
 * Supported languages:
 * English
 * Telugu
 * Hindi
 * Tamil
 * Kannada
 * Malayalam
 *
 * Supported voices:
 * Female
 * Male
 */

const TTS_BACKEND_URL =
  'https://weather-gpt-voice.onrender.com';


class TextToSpeechService {

  private audio: HTMLAudioElement | null = null;

  private audioUrl: string | null = null;


  /**
   * Check whether audio playback is supported.
   */
  public isSupported(): boolean {

    return (
      typeof window !== 'undefined' &&
      typeof Audio !== 'undefined'
    );
  }


  /**
   * Check whether audio is currently playing.
   */
  public isSpeaking(): boolean {

    return (
      this.audio !== null &&
      !this.audio.paused &&
      !this.audio.ended
    );
  }


  /**
   * Check whether audio is paused.
   */
  public isPaused(): boolean {

    return (
      this.audio !== null &&
      this.audio.paused &&
      !this.audio.ended
    );
  }


  /**
   * These methods are kept for compatibility
   * with existing WeatherGPT code.
   *
   * Voice selection is now handled by the backend,
   * so browser voices are no longer required.
   */
  public getAllVoices(): SpeechSynthesisVoice[] {

    return [];
  }


  public getVoicesForLanguage(
    _language: SupportedLanguageCode
  ): SpeechSynthesisVoice[] {

    return [];
  }


  public hasVoiceForLanguage(
    _language: SupportedLanguageCode
  ): boolean {

    return true;
  }


  /**
   * Speak text using the WeatherGPT FastAPI backend.
   *
   * gender:
   *   female
   *   male
   */
  public async speak(
    text: string,

    language: SupportedLanguageCode = 'en',

    gender: 'female' | 'male' = 'female',

    onEnd?: () => void,

    onError?: (
      err: string
    ) => void,

    _onVoiceUnavailable?: (
      lang: SupportedLanguageCode
    ) => void

  ): Promise<void> {

    /*
     * Stop any existing audio.
     */
    this.stop();


    /*
     * Clean response text.
     */
    const cleanText =
      this.sanitizeTextForSpeech(
        text
      );


    if (!cleanText) {

      if (onEnd) {
        onEnd();
      }

      return;
    }


    try {

      console.log(
        'WeatherGPT TTS request:',
        {
          language,
          gender
        }
      );


      /*
       * Send text to FastAPI backend.
       */
      const response =
        await fetch(
          `${TTS_BACKEND_URL}/tts`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body: JSON.stringify({
              text: cleanText,
              language,
              gender
            })
          }
        );


      /*
       * Check backend response.
       */
      if (!response.ok) {

        throw new Error(
          `TTS server error: ${response.status}`
        );
      }


      /*
       * Receive MP3 audio.
       */
      const audioBlob =
        await response.blob();


      if (
        !audioBlob ||
        audioBlob.size === 0
      ) {

        throw new Error(
          'TTS server returned empty audio.'
        );
      }


      /*
       * Create temporary audio URL.
       */
      this.audioUrl =
        URL.createObjectURL(
          audioBlob
        );


      /*
       * Create audio player.
       */
      this.audio =
        new Audio(
          this.audioUrl
        );


      this.audio.preload =
        'auto';


      /*
       * Audio completed.
       */
      this.audio.onended =
        () => {

          this.cleanup();

          if (onEnd) {
            onEnd();
          }
        };


      /*
       * Audio playback error.
       */
      this.audio.onerror =
        () => {

          console.error(
            'WeatherGPT audio playback error.'
          );

          this.cleanup();

          if (onError) {

            onError(
              'Audio playback error.'
            );
          }
        };


      /*
       * Start playback.
       */
      await this.audio.play();


      console.log(
        `WeatherGPT TTS playing: ${language} / ${gender}`
      );

    } catch (error) {

      console.error(
        'WeatherGPT TTS error:',
        error
      );


      this.cleanup();


      if (onError) {

        onError(
          error instanceof Error
            ? error.message
            : 'Unable to play voice response.'
        );
      }
    }
  }


  /**
   * Pause audio.
   */
  public pause(): void {

    if (
      this.audio &&
      !this.audio.paused
    ) {

      this.audio.pause();
    }
  }


  /**
   * Resume audio.
   */
  public async resume(): Promise<void> {

    if (
      this.audio &&
      this.audio.paused &&
      !this.audio.ended
    ) {

      try {

        await this.audio.play();

      } catch (error) {

        console.error(
          'Unable to resume audio:',
          error
        );
      }
    }
  }


  /**
   * Stop audio.
   */
  public stop(): void {

    if (this.audio) {

      this.audio.pause();

      this.audio.currentTime = 0;

      this.audio.onended = null;

      this.audio.onerror = null;

      this.audio = null;
    }


    if (this.audioUrl) {

      URL.revokeObjectURL(
        this.audioUrl
      );

      this.audioUrl = null;
    }
  }


  /**
   * Clean temporary audio resources.
   */
  private cleanup(): void {

    if (this.audio) {

      this.audio.onended = null;

      this.audio.onerror = null;

      this.audio = null;
    }


    if (this.audioUrl) {

      URL.revokeObjectURL(
        this.audioUrl
      );

      this.audioUrl = null;
    }
  }


  /**
   * Remove URLs and markdown before
   * sending text to the TTS backend.
   */
  private sanitizeTextForSpeech(
    text: string
  ): string {

    return text

      .replace(
        /https?:\/\/\S+/g,
        ''
      )

      .replace(
        /[*_#`~[\]()]/g,
        ' '
      )

      .replace(
        /\s+/g,
        ' '
      )

      .trim();
  }
}


export const textToSpeechService =
  new TextToSpeechService();
