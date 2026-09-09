import { SupportedLanguageCode, SUPPORTED_LANGUAGES } from '../config/languageConfig';

/**
 * MULTILINGUAL & MIXED-LANGUAGE RECOGNITION SERVICE
 * Requirement 5, 6, 8, 9 & 10: Unicode script detection, Romanized Indian language pattern matching,
 * and query normalization.
 */

export function detectLanguage(text: string, userSelectedLang: SupportedLanguageCode = 'en'): SupportedLanguageCode {
  if (!text || !text.trim()) return userSelectedLang;

  // 1. Check Unicode script ranges first (Native scripts take precedence)
  if (SUPPORTED_LANGUAGES.te.scriptRegex.test(text)) return 'te';
  if (SUPPORTED_LANGUAGES.ta.scriptRegex.test(text)) return 'ta';
  if (SUPPORTED_LANGUAGES.hi.scriptRegex.test(text)) return 'hi';
  if (SUPPORTED_LANGUAGES.kn.scriptRegex.test(text)) return 'kn';
  if (SUPPORTED_LANGUAGES.ml.scriptRegex.test(text)) return 'ml';

  const lower = text.toLowerCase();

  // 2. Romanized Indian Language Pattern Matching (Tanglish / Teluglish / Hinglish)
  if (
    lower.includes('repu') ||
    lower.includes('untadha') ||
    lower.includes('padutunda') ||
    lower.includes('aadacha') ||
    lower.includes('ikkada') ||
    lower.includes('ela undi') ||
    lower.includes('cheyyacha')
  ) {
    return 'te';
  }

  if (
    lower.includes('naalaikku') ||
    lower.includes('varuma') ||
    lower.includes('epdi') ||
    lower.includes('irukku') ||
    lower.includes('inga') ||
    lower.includes('vilayadalaama')
  ) {
    return 'ta';
  }

  if (
    lower.includes('baarish') ||
    lower.includes('kya') ||
    lower.includes('hogi') ||
    lower.includes('kar sakta') ||
    lower.includes('kal') ||
    lower.includes('kaise')
  ) {
    return 'hi';
  }

  if (
    lower.includes('barutta') ||
    lower.includes('hegide') ||
    lower.includes('illi') ||
    lower.includes('nale')
  ) {
    return 'kn';
  }

  if (
    lower.includes('mazha') ||
    lower.includes('peyyumo') ||
    lower.includes('engane') ||
    lower.includes('ivide')
  ) {
    return 'ml';
  }

  // Default to user's selected language
  return userSelectedLang;
}

/**
 * Normalizes Multilingual / Tanglish / Hinglish Queries into standardized tokens for queryUnderstandingService
 */
export function normalizeMultilingualQuery(text: string, selectedLang: SupportedLanguageCode): string {
  if (!text) return text;
  let normalized = text;
  const lower = text.toLowerCase();

  // Date Normalization
  if (
    lower.includes('repu') || // Telugu
    lower.includes('naalaikku') || // Tamil
    lower.includes('kal') || // Hindi
    lower.includes('nale') // Kannada/Malayalam
  ) {
    normalized = normalized.replace(/(repu|naalaikku|kal|nale)/gi, 'tomorrow');
  }

  if (
    lower.includes('ee roju') ||
    lower.includes('inru') ||
    lower.includes('aaj') ||
    lower.includes('indu') ||
    lower.includes('innu')
  ) {
    normalized = normalized.replace(/(ee roju|inru|aaj|indu|innu)/gi, 'today');
  }

  // Time Normalization
  if (
    lower.includes('udayam') ||
    lower.includes('kaalai') ||
    lower.includes('subah') ||
    lower.includes('belagge') ||
    lower.includes('ravile')
  ) {
    normalized = normalized.replace(/(udayam|kaalai|subah|belagge|ravile)/gi, 'morning');
  }

  if (
    lower.includes('sayantram') ||
    lower.includes('maalai') ||
    lower.includes('shaam') ||
    lower.includes('sanje') ||
    lower.includes('vaikunneram')
  ) {
    normalized = normalized.replace(/(sayantram|maalai|shaam|sanje|vaikunneram)/gi, 'evening');
  }

  // Intent & Activity Keywords Normalization
  if (
    lower.includes('rain') ||
    lower.includes('varsham') ||
    lower.includes('mazha') ||
    lower.includes('baarish') ||
    lower.includes('male') ||
    lower.includes('untadha')
  ) {
    if (!normalized.toLowerCase().includes('rain')) {
      normalized += ' rain';
    }
  }

  if (
    lower.includes('aadacha') ||
    lower.includes('khel') ||
    lower.includes('vilayad') ||
    lower.includes('play')
  ) {
    if (!normalized.toLowerCase().includes('play')) {
      normalized += ' play';
    }
  }

  if (
    lower.includes('na location') ||
    lower.includes('నా లொకేషన్') ||
    lower.includes('என் இடம்') ||
    lower.includes('meri location') ||
    lower.includes('namma location')
  ) {
    normalized = normalized.replace(/(na location|నా లొకేషన్|என் இடம்|meri location|namma location)/gi, 'here');
  }

  return normalized;
}
