import { ACTIVITIES_CONFIG, classifyActivityText, ActivityConfig } from '../config/activityConfig';

export type QueryIntent =
  | 'CURRENT_WEATHER'
  | 'WEATHER_FORECAST'
  | 'HOURLY_FORECAST'
  | 'RAIN_FORECAST'
  | 'TEMPERATURE'
  | 'WIND'
  | 'WEATHER_ALERT'
  | 'TRAVEL_DECISION'
  | 'OUTDOOR_ACTIVITY'
  | 'EVENT_PLANNING'
  | 'AGRICULTURE_WEATHER'
  | 'TIME_COMPARISON'
  | 'CLIMATE_QUESTION'
  | 'GENERAL_WEATHER'
  | 'UNKNOWN';

export interface ParsedQuery {
  originalQuery: string;
  intent: QueryIntent;
  activity?: string;
  customActivityText?: string;
  dateReference: string;
  timeReference: string;
  locationReference?: string;
  secondaryLocationReference?: string;
  climateMetric?: 'TEMPERATURE' | 'RAINFALL' | 'HUMIDITY' | 'GENERAL';
  climateDateRange?: 'CURRENT_MONTH' | 'PAST_YEAR' | 'MULTIPLE_YEARS' | '30_DAYS' | '7_DAYS' | '3_MONTHS' | '1_YEAR';
  comparisonPeriod?: 'HISTORICAL_BASELINE' | 'PREVIOUS_YEAR' | 'MULTI_YEAR';
  requiresWeather: boolean;
  requiresAlerts: boolean;
  requiresDecision: boolean;
  requiresComparison: boolean;
  requiresClarification: boolean;
  clarificationPrompt?: string;
  extractedEntities: {
    hasExplicitDate: boolean;
    hasExplicitTime: boolean;
    hasExplicitLocation: boolean;
    hasExplicitActivity: boolean;
  };
}

/**
 * INTELLIGENT QUERY UNDERSTANDING SERVICE
 * Requirement 2 & Step 9: Analyzes natural language and extracts intent, activity, date, time, location & climate references.
 */
export function parseUserQuery(queryText: string): ParsedQuery {
  const q = queryText.trim();
  const lower = q.toLowerCase();

  // 1. Detect Intent (Check CLIMATE_QUESTION intent early to avoid matching general temp/rain keywords)
  const intent = detectQueryIntent(lower);

  // 2. Extract Location References (Primary location & optional secondary location for comparison)
  const { locationReference, secondaryLocationReference } = extractLocationsFromQuery(q);

  // 3. Extract Date Reference
  const dateReference = extractDateFromQuery(lower);

  // 4. Extract Time Reference
  const timeReference = extractTimeFromQuery(lower);

  // 5. Extract Activity Reference
  const activityConfig = extractActivityFromQuery(lower);
  const activity = activityConfig?.id;
  const customActivityText = activityConfig?.id === 'custom' ? q : undefined;

  // 6. Extract Climate Parameters if intent is CLIMATE_QUESTION
  let climateMetric: 'TEMPERATURE' | 'RAINFALL' | 'HUMIDITY' | 'GENERAL' | undefined = undefined;
  let climateDateRange: 'CURRENT_MONTH' | 'PAST_YEAR' | 'MULTIPLE_YEARS' | '30_DAYS' | '7_DAYS' | '3_MONTHS' | '1_YEAR' | undefined = undefined;
  let comparisonPeriod: 'HISTORICAL_BASELINE' | 'PREVIOUS_YEAR' | 'MULTI_YEAR' | undefined = undefined;

  if (intent === 'CLIMATE_QUESTION') {
    // Determine Metric
    if (lower.includes('rain') || lower.includes('precipitation') || lower.includes('monsoon') || lower.includes('downpour')) {
      climateMetric = 'RAINFALL';
    } else if (lower.includes('humidity') || lower.includes('moisture')) {
      climateMetric = 'HUMIDITY';
    } else if (lower.includes('temp') || lower.includes('hot') || lower.includes('heat') || lower.includes('warm') || lower.includes('cold') || lower.includes('degree')) {
      climateMetric = 'TEMPERATURE';
    } else {
      climateMetric = 'GENERAL';
    }

    // Determine Date Range & Comparison Period
    if (lower.includes('last year') || lower.includes('previous year') || lower.includes('compare this month with last year')) {
      climateDateRange = 'PAST_YEAR';
      comparisonPeriod = 'PREVIOUS_YEAR';
    } else if (lower.includes('previous years') || lower.includes('multi year') || lower.includes('over the years') || lower.includes('multiple years')) {
      climateDateRange = 'MULTIPLE_YEARS';
      comparisonPeriod = 'MULTI_YEAR';
    } else if (lower.includes('7 days') || lower.includes('past week') || lower.includes('last week')) {
      climateDateRange = '7_DAYS';
      comparisonPeriod = 'HISTORICAL_BASELINE';
    } else if (lower.includes('3 months') || lower.includes('past season')) {
      climateDateRange = '3_MONTHS';
      comparisonPeriod = 'HISTORICAL_BASELINE';
    } else {
      climateDateRange = 'CURRENT_MONTH';
      comparisonPeriod = 'HISTORICAL_BASELINE';
    }
  }

  // 7. Determine Required Downstream Services
  const isDecisionIntent = intent === 'TRAVEL_DECISION' || intent === 'OUTDOOR_ACTIVITY' || intent === 'EVENT_PLANNING' || intent === 'AGRICULTURE_WEATHER' || intent === 'TIME_COMPARISON';
  const requiresDecision = isDecisionIntent || (activity !== undefined && activity !== 'custom');
  const requiresAlerts = intent === 'WEATHER_ALERT' || isDecisionIntent;
  const requiresWeather = intent !== 'CLIMATE_QUESTION' && intent !== 'UNKNOWN';
  const requiresComparison = intent === 'TIME_COMPARISON' || !!secondaryLocationReference || lower.includes('better than') || lower.includes('compare');

  // 8. Check for Missing Critical Clarification Needs
  const hasExplicitDate = dateReference !== 'now';
  const hasExplicitTime = timeReference !== 'now';
  const hasExplicitLocation = locationReference !== undefined;
  const hasExplicitActivity = activity !== undefined;

  let requiresClarification = false;
  let clarificationPrompt: string | undefined = undefined;

  if (requiresDecision && !hasExplicitDate && !hasExplicitTime && lower.startsWith('can i play')) {
    requiresClarification = true;
    clarificationPrompt = "Sure! What day and roughly what time are you planning to play?";
  }

  return {
    originalQuery: q,
    intent,
    activity,
    customActivityText,
    dateReference,
    timeReference,
    locationReference,
    secondaryLocationReference,
    climateMetric,
    climateDateRange,
    comparisonPeriod,
    requiresWeather,
    requiresAlerts,
    requiresDecision,
    requiresComparison,
    requiresClarification,
    clarificationPrompt,
    extractedEntities: {
      hasExplicitDate,
      hasExplicitTime,
      hasExplicitLocation,
      hasExplicitActivity
    }
  };
}

/**
 * Classifies Query Intent from natural language
 */
function detectQueryIntent(q: string): QueryIntent {
  // 1. CLIMATE / HISTORICAL INTENT DETECTION (Must run first for accuracy)
  if (
    q.includes('climate') ||
    q.includes('global warming') ||
    q.includes('monsoon trend') ||
    q.includes('historical') ||
    q.includes('historically') ||
    q.includes('hotter than usual') ||
    q.includes('unusually hot') ||
    q.includes('last year') ||
    q.includes('past month') ||
    q.includes('temperature trend') ||
    q.includes('rainfall trend') ||
    q.includes('rainfall changed') ||
    q.includes('rainfall increased') ||
    q.includes('compared with last year') ||
    q.includes('compare this month') ||
    q.includes('compare chennai and bengaluru') ||
    q.includes('weather history') ||
    q.includes('compare with previous years') ||
    q.includes('this year compare') ||
    q.includes('నెల సాధారణం కంటే') || // Telugu: "Is this month hotter than usual?"
    q.includes('kanna hot ga') ||     // Roman Telugu
    q.includes('सामान्य से ज्यादा') ||   // Hindi
    q.includes('வழக்கத்தை விட அதிக')   // Tamil
  ) {
    return 'CLIMATE_QUESTION';
  }

  if (q.includes('better than') || (q.includes('or') && (q.includes('morning') || q.includes('evening')))) {
    return 'TIME_COMPARISON';
  }

  if (q.includes('warning') || q.includes('alert') || q.includes('advisory') || q.includes('severe') || q.includes('watch') || q.includes('in my area')) {
    return 'WEATHER_ALERT';
  }

  if (q.includes('irrigate') || q.includes('crop') || q.includes('farm') || q.includes('water crop')) {
    return 'AGRICULTURE_WEATHER';
  }

  if (q.includes('event') || q.includes('college') || q.includes('cultural') || q.includes('wedding') || q.includes('party') || q.includes('conduct')) {
    return 'EVENT_PLANNING';
  }

  if (q.includes('cricket') || q.includes('football') || q.includes('sport') || q.includes('play') || q.includes('match') || q.includes('run') || q.includes('hike')) {
    return 'OUTDOOR_ACTIVITY';
  }

  if (q.includes('travel') || q.includes('commute') || q.includes('drive') || q.includes('bike') || q.includes('ride') || q.includes('road trip')) {
    return 'TRAVEL_DECISION';
  }

  if (q.includes('umbrella') || q.includes('rain') || q.includes('raincoat') || q.includes('shower') || q.includes('downpour')) {
    return 'RAIN_FORECAST';
  }

  if (q.includes('temp') || q.includes('hot') || q.includes('cold') || q.includes('celsius') || q.includes('degree') || q.includes('cooler') || q.includes('hotter')) {
    return 'TEMPERATURE';
  }

  if (q.includes('wind') || q.includes('gust') || q.includes('breeze')) {
    return 'WIND';
  }

  if (q.includes('forecast') || q.includes('tomorrow') || q.includes('next week') || q.includes('weekend')) {
    return 'WEATHER_FORECAST';
  }

  if (q.includes('now') || q.includes('right now') || q.includes('current') || q.includes('outside')) {
    return 'CURRENT_WEATHER';
  }

  if (q.includes('weather') || q.includes('how is') || q.includes('what is')) {
    return 'GENERAL_WEATHER';
  }

  return 'UNKNOWN';
}

/**
 * Extracts Primary & Secondary Location References from text
 */
function extractLocationsFromQuery(query: string): { locationReference?: string; secondaryLocationReference?: string } {
  const q = query.trim();
  const lower = q.toLowerCase();

  // Dual location pattern
  const dualMatch = query.match(/compare\s+([A-Za-z\s]+)\s+and\s+([A-Za-z\s]+)/i) ||
                    query.match(/between\s+([A-Za-z\s]+)\s+and\s+([A-Za-z\s]+)/i) ||
                    query.match(/which was hotter historically,?\s+([A-Za-z\s]+)\s+or\s+([A-Za-z\s]+)/i);

  if (dualMatch && dualMatch[1] && dualMatch[2]) {
    const locA = dualMatch[1].replace(/weather|history|historically/gi, '').trim();
    const locB = dualMatch[2].replace(/weather|history|historically/gi, '').trim();
    return {
      locationReference: locA,
      secondaryLocationReference: locB
    };
  }

  // Regional script city matching
  if (q.includes('హైదరాబాద్') || q.includes('హైదరాబాద్లో') || lower.includes('hyderabad')) return { locationReference: 'Hyderabad' };
  if (q.includes('చెన్నై') || lower.includes('chennai')) return { locationReference: 'Chennai' };
  if (q.includes('బెంగళూరు') || lower.includes('bengaluru') || lower.includes('bangalore')) return { locationReference: 'Bengaluru' };
  if (q.includes('ముంబై') || lower.includes('mumbai')) return { locationReference: 'Mumbai' };
  if (q.includes('ఢిల్లీ') || lower.includes('delhi')) return { locationReference: 'Delhi' };
  if (q.includes('పూణే') || lower.includes('pune')) return { locationReference: 'Pune' };
  if (q.includes('విజయవాడ') || lower.includes('vijayawada')) return { locationReference: 'Vijayawada' };
  if (q.includes('విశాఖపట్నం') || lower.includes('visakhapatnam') || lower.includes('vizag')) return { locationReference: 'Visakhapatnam' };
  if (q.includes('తిరుపతి') || lower.includes('tirupati')) return { locationReference: 'Tirupati' };
  if (lower.includes('london')) return { locationReference: 'London' };
  if (lower.includes('dubai')) return { locationReference: 'Dubai' };
  if (lower.includes('singapore')) return { locationReference: 'Singapore' };
  if (lower.includes('new york')) return { locationReference: 'New York' };

  // Single location extraction
  const matchIn = query.match(/in\s+([A-Za-z\s]+)/i) || query.match(/lo\s+([A-Za-z\s]+)/i) || query.match(/la\s+([A-Za-z\s]+)/i) || query.match(/mein\s+([A-Za-z\s]+)/i);
  if (matchIn && matchIn[1]) {
    const loc = matchIn[1].split(/\s+for\s+|\s+tomorrow\s+|\s+today\s+|\s+at\s+|\s+in\s+|\s+lo\s+|\s+mein\s+|\s+la\s+|\s+historically\s+/i)[0].trim();
    if (loc && loc.toLowerCase() !== 'my area' && loc.toLowerCase() !== 'the morning' && loc.toLowerCase() !== 'the evening') {
      return { locationReference: loc };
    }
  }

  const matchFor = query.match(/for\s+([A-Za-z\s]+)/i);
  if (matchFor && matchFor[1]) {
    const loc = matchFor[1].split(/\s+tomorrow\s+|\s+today\s+|\s+at\s+/i)[0].trim();
    if (loc && loc.toLowerCase() !== 'cricket' && loc.toLowerCase() !== 'travel') {
      return { locationReference: loc };
    }
  }

  if (lower.includes('here') || lower.includes('my location') || lower.includes('current location')) {
    return { locationReference: 'current_location' };
  }

  return {};
}

/**
 * Extracts Date Reference
 */
function extractDateFromQuery(q: string): string {
  if (q.includes('tomorrow') || q.includes('రేపు') || q.includes('repu') || q.includes('kal') || q.includes('कल') || q.includes('naalaikku') || q.includes('நாளை')) return 'Tomorrow';
  if (q.includes('today') || q.includes('ఈ రోజు') || q.includes('నేడు') || q.includes('ee roju') || q.includes('aaj') || q.includes('आज') || q.includes('tonight') || q.includes('now')) return 'Today';
  if (q.includes('weekend')) return 'This Weekend';
  if (q.includes('last year')) return 'Last Year';
  if (q.includes('past month') || q.includes('this month')) return 'This Month';
  return 'today';
}

/**
 * Extracts Time Reference
 */
function extractTimeFromQuery(q: string): string {
  if (q.includes('morning') || q.includes('ఉదయం') || q.includes('udayam') || q.includes('subah') || q.includes('सुबह') || q.includes('kaalai') || q.includes('காலை')) return 'Morning';
  if (q.includes('afternoon') || q.includes('మధ్యాహ్నం') || q.includes('dopahar') || q.includes('దోపహర్')) return 'Afternoon';
  if (q.includes('evening') || q.includes('సాయంత్రం') || q.includes('sayanthram') || q.includes('shaam') || q.includes('शाम') || q.includes('maalai') || q.includes('மாலை') || q.includes('tonight')) return 'Evening';
  if (q.includes('night') || q.includes('రాత్రి') || q.includes('raatri') || q.includes('रात')) return 'Night';

  const timeMatch = q.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (timeMatch) {
    return `${timeMatch[1]}${timeMatch[3].toUpperCase()}`;
  }

  return 'now';
}

/**
 * Extracts Activity Config from Query Text
 */
function extractActivityFromQuery(q: string): ActivityConfig | undefined {
  if (q.includes('cricket') || q.includes('క్రికెట్') || q.includes('क्रिकेट') || q.includes('கிரிக்கெட்')) return ACTIVITIES_CONFIG.cricket;
  if (q.includes('football') || q.includes('ఫుట్‌బాల్') || q.includes('फुटबॉल')) return ACTIVITIES_CONFIG.football;
  if (q.includes('run') || q.includes('jog') || q.includes('పరుగు') || q.includes('రన్నింగ్')) return ACTIVITIES_CONFIG.running;
  if (q.includes('cycl') || q.includes('bicycle') || q.includes('సైక్లింగ్')) return ACTIVITIES_CONFIG.cycling;
  if (q.includes('walk') || q.includes('వాకింగ్')) return ACTIVITIES_CONFIG.walking;
  if (q.includes('hike') || q.includes('trek') || q.includes('ట్రెక్')) return ACTIVITIES_CONFIG.hiking;
  if (q.includes('camp') || q.includes('క్యాంపింగ్')) return ACTIVITIES_CONFIG.camping;
  if (q.includes('beach') || q.includes('బీచ్')) return ACTIVITIES_CONFIG.beach_visit;
  if (q.includes('picnic') || q.includes('పిక్నిక్')) return ACTIVITIES_CONFIG.picnic;
  if (q.includes('construct') || q.includes('నిర్మాణం')) return ACTIVITIES_CONFIG.construction;
  if (q.includes('wedding') || q.includes('party') || q.includes('event') || q.includes('ఫంక్షన్') || q.includes('ఈవెంట్')) return ACTIVITIES_CONFIG.outdoor_event;
  if (q.includes('college') || q.includes('school') || q.includes('కాలేజ్') || q.includes('స్కూల్')) return ACTIVITIES_CONFIG.school_event;
  if (q.includes('farm') || q.includes('agri') || q.includes('crop') || q.includes('వ్యవసాయం')) return ACTIVITIES_CONFIG.outdoor_work;
  if (q.includes('drive') || q.includes('road') || q.includes('travel') || q.includes('trip') || q.includes('ప్రయాణం')) return ACTIVITIES_CONFIG.road_travel;
  if (q.includes('bike') || q.includes('ride') || q.includes('motorcycle') || q.includes('రైడ్')) return ACTIVITIES_CONFIG.bike_ride;
  if (q.includes('photo') || q.includes('visit') || q.includes('sightseeing') || q.includes('సందర్శన')) return ACTIVITIES_CONFIG.photography;

  // Verbs indicating activity questions
  if (q.includes('aadacha') || q.includes('aadolya') || q.includes('aadavacha') || q.includes('khel') || q.includes('play')) {
    return ACTIVITIES_CONFIG.cricket;
  }

  return undefined;
}

