export type SupportedLanguageCode = 'en' | 'te' | 'ta' | 'hi' | 'kn' | 'ml';

export interface LanguageConfig {
  code: SupportedLanguageCode;
  displayName: string;
  nativeName: string;
  flagEmoji: string;
  scriptRegex: RegExp;
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguageCode, LanguageConfig> = {
  en: {
    code: 'en',
    displayName: 'English',
    nativeName: 'English',
    flagEmoji: '🇬🇧',
    scriptRegex: /^[\u0000-\u007F]+$/
  },
  te: {
    code: 'te',
    displayName: 'Telugu',
    nativeName: 'తెలుగు',
    flagEmoji: '🇮🇳',
    scriptRegex: /[\u0C00-\u0C7F]/
  },
  ta: {
    code: 'ta',
    displayName: 'Tamil',
    nativeName: 'தமிழ்',
    flagEmoji: '🇮🇳',
    scriptRegex: /[\u0B80-\u0BFF]/
  },
  hi: {
    code: 'hi',
    displayName: 'Hindi',
    nativeName: 'हिन्दी',
    flagEmoji: '🇮🇳',
    scriptRegex: /[\u0900-\u097F]/
  },
  kn: {
    code: 'kn',
    displayName: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flagEmoji: '🇮🇳',
    scriptRegex: /[\u0C80-\u0CFF]/
  },
  ml: {
    code: 'ml',
    displayName: 'Malayalam',
    nativeName: 'മലയാളം',
    flagEmoji: '🇮🇳',
    scriptRegex: /[\u0D00-\u0D7F]/
  }
};

export const DEFAULT_LANGUAGE: SupportedLanguageCode = 'en';
