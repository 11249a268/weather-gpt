import { LocationSearchResult } from './weatherProviders/openMeteoProvider';
import { ParsedQuery, QueryIntent } from './queryUnderstandingService';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  structuredResponse?: any;
  debugInfo?: any;
}

export interface ConversationContextState {
  activeLocation: LocationSearchResult;
  secondaryLocation?: LocationSearchResult;
  lastActivity?: string;
  lastCustomActivityText?: string;
  lastDateStr?: string;
  lastTimeInput?: string;
  lastIntent?: QueryIntent;
  lastClimateMetric?: 'TEMPERATURE' | 'RAINFALL' | 'HUMIDITY' | 'GENERAL';
  lastClimateDateRange?: 'CURRENT_MONTH' | 'PAST_YEAR' | 'MULTIPLE_YEARS' | '30_DAYS' | '7_DAYS' | '3_MONTHS' | '1_YEAR';
  lastComparisonPeriod?: 'HISTORICAL_BASELINE' | 'PREVIOUS_YEAR' | 'MULTI_YEAR';
  history: ChatMessage[];
}

const CONTEXT_STORAGE_KEY = 'weathergpt_conversation_context_v1';

// Initial default state
let sessionState: ConversationContextState = {
  activeLocation: {
    id: 1,
    name: 'Chennai',
    admin1: 'Tamil Nadu',
    country: 'India',
    latitude: 13.0827,
    longitude: 80.2707,
    timezone: 'Asia/Kolkata'
  },
  history: []
};

/**
 * Returns current conversation state
 */
export function getConversationState(): ConversationContextState {
  try {
    const stored = localStorage.getItem(CONTEXT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      sessionState = { ...sessionState, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load conversation context', e);
  }
  return sessionState;
}

/**
 * Updates active location in conversation context
 */
export function updateConversationLocation(location: LocationSearchResult): ConversationContextState {
  sessionState.activeLocation = location;
  saveConversationState();
  return sessionState;
}

/**
 * Updates secondary location for dual location comparisons
 */
export function updateSecondaryLocation(location: LocationSearchResult): ConversationContextState {
  sessionState.secondaryLocation = location;
  saveConversationState();
  return sessionState;
}

/**
 * Merges newly parsed query entities with existing conversation context (Requirements 30 & 31 & 56)
 */
export function mergeQueryContext(parsed: ParsedQuery): {
  activity: string;
  customActivityText?: string;
  dateStr: string;
  timeInput: string;
  location: LocationSearchResult;
  secondaryLocation?: LocationSearchResult;
  climateMetric: 'TEMPERATURE' | 'RAINFALL' | 'HUMIDITY' | 'GENERAL';
  climateDateRange: 'CURRENT_MONTH' | 'PAST_YEAR' | 'MULTIPLE_YEARS' | '30_DAYS' | '7_DAYS' | '3_MONTHS' | '1_YEAR';
  comparisonPeriod: 'HISTORICAL_BASELINE' | 'PREVIOUS_YEAR' | 'MULTI_YEAR';
  isFollowUp: boolean;
} {
  let isFollowUp = false;
  const lower = parsed.originalQuery.toLowerCase();

  // Climate context merge logic (Requirement 30, 31 & 56)
  let climateMetric = parsed.climateMetric || 'GENERAL';
  let climateDateRange = parsed.climateDateRange || 'CURRENT_MONTH';
  let comparisonPeriod = parsed.comparisonPeriod || 'HISTORICAL_BASELINE';

  const isClimateFollowUp = sessionState.lastIntent === 'CLIMATE_QUESTION' || parsed.intent === 'CLIMATE_QUESTION' || lower.includes('what about');

  if (isClimateFollowUp) {
    if (!parsed.climateMetric && sessionState.lastClimateMetric) {
      climateMetric = sessionState.lastClimateMetric;
      isFollowUp = true;
    }
    if (!parsed.climateDateRange && sessionState.lastClimateDateRange) {
      climateDateRange = sessionState.lastClimateDateRange;
      isFollowUp = true;
    }
    if (!parsed.comparisonPeriod && sessionState.lastComparisonPeriod) {
      comparisonPeriod = sessionState.lastComparisonPeriod;
      isFollowUp = true;
    }
  }

  // Activity merge
  let activity = parsed.activity;
  let customActivityText = parsed.customActivityText;

  if (!activity && sessionState.lastActivity) {
    activity = sessionState.lastActivity;
    customActivityText = sessionState.lastCustomActivityText;
    isFollowUp = true;
  }
  if (!activity) {
    activity = 'cricket';
  }

  // Date merge
  let dateStr = parsed.dateReference;
  if ((!parsed.extractedEntities.hasExplicitDate || dateStr === 'today') && sessionState.lastDateStr && isFollowUp) {
    dateStr = sessionState.lastDateStr;
  }

  // Time merge
  let timeInput = parsed.timeReference;
  if (timeInput === 'now' && sessionState.lastTimeInput && (lower.includes('what about') || isFollowUp)) {
    timeInput = sessionState.lastTimeInput;
  } else if (timeInput === 'now' && parsed.requiresDecision) {
    timeInput = 'Afternoon';
  }

  // Update State Session Memory
  sessionState.lastActivity = activity;
  sessionState.lastCustomActivityText = customActivityText;
  sessionState.lastDateStr = dateStr;
  sessionState.lastTimeInput = timeInput;
  sessionState.lastIntent = parsed.intent;
  sessionState.lastClimateMetric = climateMetric;
  sessionState.lastClimateDateRange = climateDateRange;
  sessionState.lastComparisonPeriod = comparisonPeriod;

  saveConversationState();

  return {
    activity,
    customActivityText,
    dateStr,
    timeInput,
    location: sessionState.activeLocation,
    secondaryLocation: sessionState.secondaryLocation,
    climateMetric,
    climateDateRange,
    comparisonPeriod,
    isFollowUp
  };
}

/**
 * Adds message to conversation history
 */
export function addChatMessage(msg: ChatMessage): void {
  sessionState.history.push(msg);
  if (sessionState.history.length > 20) {
    sessionState.history = sessionState.history.slice(-20);
  }
  saveConversationState();
}

/**
 * Clears conversation history & context
 */
export function clearConversationState(): ConversationContextState {
  sessionState = {
    activeLocation: sessionState.activeLocation,
    history: []
  };
  try {
    localStorage.removeItem(CONTEXT_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear conversation state', e);
  }
  return sessionState;
}

function saveConversationState(): void {
  try {
    localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(sessionState));
  } catch (e) {
    console.error('Failed to save conversation state', e);
  }
}

