import React, {
  createContext,
  useContext,
  useState
} from 'react';

import {
  SupportedLanguageCode,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE
} from '../config/languageConfig';

import {
  LOCALES
} from '../locales/localesData';

export type VoiceGender = 'female' | 'male';

interface LanguageContextType {
  currentLanguage: SupportedLanguageCode;
  selectedLanguage: SupportedLanguageCode;
  setLanguage: (lang: SupportedLanguageCode) => void;

  autoSpeak: boolean;
  setAutoSpeak: (val: boolean) => void;

  selectedVoiceURI: string;
  setSelectedVoiceURI: (uri: string) => void;

  voiceGender: VoiceGender;
  setVoiceGender: (gender: VoiceGender) => void;

  t: (
    key: string,
    defaultText?: string
  ) => string;
}

const STORAGE_KEY_LANG =
  'weathergpt_user_lang';

const STORAGE_KEY_AUTO_SPEAK =
  'weathergpt_auto_speak';

const STORAGE_KEY_VOICE_URI =
  'weathergpt_voice_uri';

const STORAGE_KEY_VOICE_GENDER =
  'weathergpt_voice_gender';

const LanguageContext =
  createContext<LanguageContextType>({
    currentLanguage: DEFAULT_LANGUAGE,
    selectedLanguage: DEFAULT_LANGUAGE,

    setLanguage: () => {},

    autoSpeak: false,

    setAutoSpeak: () => {},

    selectedVoiceURI: '',

    setSelectedVoiceURI: () => {},

    voiceGender: 'female',

    setVoiceGender: () => {},

    t: (
      key: string,
      defaultText?: string
    ) => defaultText || key
  });

export const LanguageProvider:
  React.FC<{
    children: React.ReactNode;
  }> = ({
    children
  }) => {

  const [
    currentLanguage,
    setCurrentLanguageState
  ] = useState<SupportedLanguageCode>(() => {

    try {
      const saved =
        localStorage.getItem(
          STORAGE_KEY_LANG
        );

      if (
        saved &&
        SUPPORTED_LANGUAGES[
          saved as SupportedLanguageCode
        ]
      ) {
        return saved as SupportedLanguageCode;
      }

    } catch (e) {
      console.error(
        'Failed to load language preference',
        e
      );
    }

    return DEFAULT_LANGUAGE;
  });


  const [
    autoSpeak,
    setAutoSpeakState
  ] = useState<boolean>(() => {

    try {
      return (
        localStorage.getItem(
          STORAGE_KEY_AUTO_SPEAK
        ) === 'true'
      );

    } catch (e) {
      return false;
    }
  });


  const [
    selectedVoiceURI,
    setSelectedVoiceURIState
  ] = useState<string>(() => {

    try {
      return (
        localStorage.getItem(
          STORAGE_KEY_VOICE_URI
        ) || ''
      );

    } catch (e) {
      return '';
    }
  });


  /*
   * NEW:
   * Stores Female / Male preference
   */
  const [
    voiceGender,
    setVoiceGenderState
  ] = useState<VoiceGender>(() => {

    try {

      const saved =
        localStorage.getItem(
          STORAGE_KEY_VOICE_GENDER
        );

      if (
        saved === 'female' ||
        saved === 'male'
      ) {
        return saved;
      }

    } catch (e) {
      console.error(
        'Failed to load voice gender preference',
        e
      );
    }

    return 'female';
  });


  const setLanguage = (
    lang: SupportedLanguageCode
  ) => {

    setCurrentLanguageState(lang);

    try {
      localStorage.setItem(
        STORAGE_KEY_LANG,
        lang
      );

    } catch (e) {

      console.error(
        'Failed to save language preference',
        e
      );
    }
  };


  const setAutoSpeak = (
    val: boolean
  ) => {

    setAutoSpeakState(val);

    try {

      localStorage.setItem(
        STORAGE_KEY_AUTO_SPEAK,
        String(val)
      );

    } catch (e) {

      console.error(
        'Failed to save auto speak preference',
        e
      );
    }
  };


  const setSelectedVoiceURI = (
    uri: string
  ) => {

    setSelectedVoiceURIState(uri);

    try {

      localStorage.setItem(
        STORAGE_KEY_VOICE_URI,
        uri
      );

    } catch (e) {

      console.error(
        'Failed to save voice URI preference',
        e
      );
    }
  };


  /*
   * NEW:
   * Saves Female / Male preference
   */
  const setVoiceGender = (
    gender: VoiceGender
  ) => {

    setVoiceGenderState(gender);

    try {

      localStorage.setItem(
        STORAGE_KEY_VOICE_GENDER,
        gender
      );

    } catch (e) {

      console.error(
        'Failed to save voice gender preference',
        e
      );
    }
  };


  const t = (
    key: string,
    defaultText?: string
  ): string => {

    const localeDict =
      LOCALES[currentLanguage] ||
      LOCALES.en;

    if (
      localeDict &&
      localeDict[key]
    ) {
      return localeDict[key];
    }

    if (
      LOCALES.en[key]
    ) {
      return LOCALES.en[key];
    }

    return defaultText || key;
  };


  return (

    <LanguageContext.Provider
      value={{

        currentLanguage,
        selectedLanguage: currentLanguage,

        setLanguage,

        autoSpeak,

        setAutoSpeak,

        selectedVoiceURI,

        setSelectedVoiceURI,

        /*
         * NEW
         */
        voiceGender,

        setVoiceGender,

        t
      }}
    >

      {children}

    </LanguageContext.Provider>
  );
};


export const useLanguage =
  () => useContext(LanguageContext);
