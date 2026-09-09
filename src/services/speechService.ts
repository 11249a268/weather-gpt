import { SupportedLanguageCode } from '../config/languageConfig';

/**
 * SPEECH-TO-TEXT SERVICE (Requirement 8.2 & 8.3)
 * Uses browser Web Speech API (SpeechRecognition / webkitSpeechRecognition)
 * mapped to Indian language locales (en-IN, te-IN, ta-IN, hi-IN, kn-IN, ml-IN).
 */

const SPEECH_LOCALES: Record<SupportedLanguageCode, string> = {
  en: 'en-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
  ml: 'ml-IN'
};

export type SpeechState = 'idle' | 'listening' | 'processing' | 'error';

class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public startListening(
    language: SupportedLanguageCode,
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (errorMsg: string) => void,
    onStateChange?: (state: SpeechState) => void
  ): void {
    if (!this.isSupported()) {
      onError('Voice input is not supported in this browser. Please use text input.');
      if (onStateChange) onStateChange('error');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    const locale = SPEECH_LOCALES[language] || 'en-IN';
    this.recognition.lang = locale;
    this.isListening = true;

    if (onStateChange) onStateChange('listening');

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentText = finalTranscript || interimTranscript;
      const isFinal = !!finalTranscript;

      onResult(currentText, isFinal);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      if (onStateChange) onStateChange('error');
      onError(`Speech recognition error: ${event.error || 'Permission denied or network issue.'}`);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onStateChange) onStateChange('idle');
    };

    try {
      this.recognition.start();
    } catch (e) {
      this.isListening = false;
      if (onStateChange) onStateChange('error');
      onError('Microphone access was interrupted. Please try again.');
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}

export const speechService = new SpeechService();
