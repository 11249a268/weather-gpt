import {
  ACTIVITIES_CONFIG,
  ActivityConfig
} from '../config/activityConfig';

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

  climateDateRange?:
    | 'CURRENT_MONTH'
    | 'PAST_YEAR'
    | 'MULTIPLE_YEARS'
    | '30_DAYS'
    | '7_DAYS'
    | '3_MONTHS'
    | '1_YEAR';

  comparisonPeriod?:
    | 'HISTORICAL_BASELINE'
    | 'PREVIOUS_YEAR'
    | 'MULTI_YEAR';

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
 * Main natural-language query parser.
 *
 * Important design rule:
 *
 * A new question is interpreted from the CURRENT question first.
 * Previous activity/context must not automatically become the activity
 * of the current question.
 */
export function parseUserQuery(queryText: string): ParsedQuery {
  const q = queryText.trim();
  const lower = q.toLowerCase();

  const intent = detectQueryIntent(lower);

  const {
    locationReference,
    secondaryLocationReference
  } = extractLocationsFromQuery(q);

  const dateReference = extractDateFromQuery(lower);
  const timeReference = extractTimeFromQuery(lower);

  /*
   * Activity is deliberately conservative.
   *
   * We only return an activity when the user clearly names one.
   *
   * Example:
   *   "Can I play cricket?" -> cricket
   *   "Can I play outside?" -> no activity
   *   "Can I go outside?" -> no activity
   *   "Can I run outside?" -> running
   */
  const activityConfig = extractActivityFromQuery(lower);

  const activity = activityConfig?.id;

  const customActivityText =
    activityConfig?.id === 'custom'
      ? q
      : undefined;

  let climateMetric:
    | 'TEMPERATURE'
    | 'RAINFALL'
    | 'HUMIDITY'
    | 'GENERAL'
    | undefined;

  let climateDateRange:
    | 'CURRENT_MONTH'
    | 'PAST_YEAR'
    | 'MULTIPLE_YEARS'
    | '30_DAYS'
    | '7_DAYS'
    | '3_MONTHS'
    | '1_YEAR'
    | undefined;

  let comparisonPeriod:
    | 'HISTORICAL_BASELINE'
    | 'PREVIOUS_YEAR'
    | 'MULTI_YEAR'
    | undefined;

  /*
   * Climate / historical questions
   */
  if (intent === 'CLIMATE_QUESTION') {
    if (
      lower.includes('rain') ||
      lower.includes('rainfall') ||
      lower.includes('precipitation') ||
      lower.includes('monsoon') ||
      lower.includes('downpour')
    ) {
      climateMetric = 'RAINFALL';
    } else if (
      lower.includes('humidity') ||
      lower.includes('moisture')
    ) {
      climateMetric = 'HUMIDITY';
    } else if (
      lower.includes('temperature') ||
      lower.includes('temp') ||
      lower.includes('hot') ||
      lower.includes('heat') ||
      lower.includes('warm') ||
      lower.includes('cold') ||
      lower.includes('degree')
    ) {
      climateMetric = 'TEMPERATURE';
    } else {
      climateMetric = 'GENERAL';
    }

    if (
      lower.includes('last year') ||
      lower.includes('previous year') ||
      lower.includes('compare this month with last year')
    ) {
      climateDateRange = 'PAST_YEAR';
      comparisonPeriod = 'PREVIOUS_YEAR';
    } else if (
      lower.includes('previous years') ||
      lower.includes('multi year') ||
      lower.includes('multi-year') ||
      lower.includes('over the years') ||
      lower.includes('multiple years')
    ) {
      climateDateRange = 'MULTIPLE_YEARS';
      comparisonPeriod = 'MULTI_YEAR';
    } else if (
      lower.includes('7 days') ||
      lower.includes('past week') ||
      lower.includes('last week')
    ) {
      climateDateRange = '7_DAYS';
      comparisonPeriod = 'HISTORICAL_BASELINE';
    } else if (
      lower.includes('30 days') ||
      lower.includes('past 30 days')
    ) {
      climateDateRange = '30_DAYS';
      comparisonPeriod = 'HISTORICAL_BASELINE';
    } else if (
      lower.includes('3 months') ||
      lower.includes('past season')
    ) {
      climateDateRange = '3_MONTHS';
      comparisonPeriod = 'HISTORICAL_BASELINE';
    } else {
      climateDateRange = 'CURRENT_MONTH';
      comparisonPeriod = 'HISTORICAL_BASELINE';
    }
  }

  /*
   * IMPORTANT:
   *
   * Risk Analyzer is NOT activated just because the question is a
   * general weather question.
   *
   * It requires a clearly identified activity or an explicit decision
   * intent that has an actual activity attached to it.
   */
  const hasExplicitActivity =
    activity !== undefined &&
    activity !== 'custom';

  const activityDecisionIntent =
    intent === 'OUTDOOR_ACTIVITY' ||
    intent === 'TRAVEL_DECISION' ||
    intent === 'EVENT_PLANNING' ||
    intent === 'AGRICULTURE_WEATHER';

  const requiresDecision =
    hasExplicitActivity ||
    (activityDecisionIntent && hasExplicitActivity);

  const requiresAlerts =
    intent === 'WEATHER_ALERT' ||
    (
      requiresDecision &&
      (
        intent === 'TRAVEL_DECISION' ||
        intent === 'OUTDOOR_ACTIVITY'
      )
    );

  /*
   * Unknown weather-style natural-language questions should still
   * continue through the normal weather pipeline.
   *
   * We do NOT want the application to immediately say:
   * "Could you rephrase your question?"
   */
  const requiresWeather =
    intent !== 'CLIMATE_QUESTION';

  const requiresComparison =
    intent === 'TIME_COMPARISON' ||
    !!secondaryLocationReference ||
    lower.includes('better than') ||
    lower.includes('compare') ||
    lower.includes('versus') ||
    lower.includes('vs');

  const hasExplicitDate =
    dateReference !== 'now' &&
    dateReference !== 'today';

  const hasExplicitTime =
    timeReference !== 'now';

  const hasExplicitLocation =
    locationReference !== undefined;

  let requiresClarification = false;
  let clarificationPrompt: string | undefined;

  /*
   * Only ask for clarification when the user explicitly asks for
   * an activity decision but essential timing is genuinely required.
   *
   * Do NOT ask this for normal questions such as:
   * "Can I go outside now?"
   */
  if (
    hasExplicitActivity &&
    requiresDecision &&
    !hasExplicitDate &&
    !hasExplicitTime &&
    isExplicitlyTimeSensitiveActivityQuestion(lower)
  ) {
    requiresClarification = true;

    clarificationPrompt =
      'What day and roughly what time are you planning this activity?';
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
      hasExplicitActivity: hasExplicitActivity
    }
  };
}


/**
 * Detect what the CURRENT question is asking.
 *
 * Ordering is important.
 * Specific meanings are checked before generic weather words.
 */
function detectQueryIntent(q: string): QueryIntent {

  /*
   * 1. Historical / climate questions
   */
  if (
    q.includes('climate') ||
    q.includes('global warming') ||
    q.includes('climate change') ||
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
    q.includes('weather history') ||
    q.includes('compare with previous years') ||
    q.includes('this year compare') ||

    // Telugu
    q.includes('నెల సాధారణం కంటే') ||
    q.includes('వాతావరణ చరిత్ర') ||
    q.includes('గత సంవత్సరం') ||

    // Hindi
    q.includes('सामान्य से ज्यादा') ||
    q.includes('पिछले साल') ||
    q.includes('मौसम का इतिहास') ||

    // Tamil
    q.includes('வழக்கத்தை விட அதிக') ||
    q.includes('கடந்த ஆண்டு') ||
    q.includes('வானிலை வரலாறு') ||

    // Kannada
    q.includes('ಕಳೆದ ವರ್ಷ') ||
    q.includes('ಹವಾಮಾನ ಇತಿಹಾಸ') ||

    // Malayalam
    q.includes('കഴിഞ്ഞ വർഷം') ||
    q.includes('കാലാവസ്ഥ ചരിത്രം')
  ) {
    return 'CLIMATE_QUESTION';
  }


  /*
   * 2. Comparison questions
   */
  if (
    q.includes('better than') ||
    q.includes('versus') ||
    q.includes(' vs ') ||
    q.includes('compare') ||
    q.includes('which is better') ||
    (
      q.includes(' or ') &&
      (
        q.includes('morning') ||
        q.includes('evening') ||
        q.includes('afternoon')
      )
    )
  ) {
    return 'TIME_COMPARISON';
  }


  /*
   * 3. Weather warnings
   */
  if (
    q.includes('warning') ||
    q.includes('alert') ||
    q.includes('advisory') ||
    q.includes('severe weather') ||
    q.includes('storm warning') ||
    q.includes('cyclone warning') ||
    q.includes('watch') ||
    q.includes('danger') ||
    q.includes('unsafe') ||
    q.includes('in my area')
  ) {
    return 'WEATHER_ALERT';
  }


  /*
   * 4. Agriculture
   */
  if (
    q.includes('irrigate') ||
    q.includes('irrigation') ||
    q.includes('crop') ||
    q.includes('farm') ||
    q.includes('farming') ||
    q.includes('agriculture') ||
    q.includes('water crop')
  ) {
    return 'AGRICULTURE_WEATHER';
  }


  /*
   * 5. Events
   */
  if (
    q.includes('wedding') ||
    q.includes('party') ||
    q.includes('event') ||
    q.includes('function') ||
    q.includes('college event') ||
    q.includes('school event') ||
    q.includes('cultural program') ||
    q.includes('conduct an event')
  ) {
    return 'EVENT_PLANNING';
  }


  /*
   * 6. Explicit outdoor activity
   *
   * Notice:
   *
   * We DO NOT use a generic "play" keyword here.
   *
   * "Can I play outside?" is not automatically Cricket.
   */
  if (
    q.includes('cricket') ||
    q.includes('football') ||
    q.includes('basketball') ||
    q.includes('tennis') ||
    q.includes('badminton') ||
    q.includes('sport') ||
    q.includes('sports') ||
    q.includes('match') ||
    q.includes('running') ||
    q.includes('jogging') ||
    q.includes('cycling') ||
    q.includes('hiking') ||
    q.includes('trekking') ||
    q.includes('camping') ||
    q.includes('picnic') ||
    q.includes('beach')
  ) {
    return 'OUTDOOR_ACTIVITY';
  }


  /*
   * 7. Travel
   *
   * Natural human expressions are supported.
   *
   * Examples:
   * "Can I go to Melbourne now?"
   * "Can I come to Chennai today?"
   * "Should I travel to Delhi?"
   * "Is it safe to drive?"
   */
  if (
    q.includes('travel') ||
    q.includes('commute') ||
    q.includes('drive') ||
    q.includes('road trip') ||
    q.includes('trip') ||
    q.includes('go to ') ||
    q.includes('come to ') ||
    q.includes('head to ') ||
    q.includes('heading to ') ||
    q.includes('should i go ') ||
    q.includes('can i go ') ||
    q.includes('can i come ') ||
    q.includes('is it safe to travel') ||
    q.includes('safe to drive') ||
    q.includes('safe to ride')
  ) {
    return 'TRAVEL_DECISION';
  }


  /*
   * 8. Rain
   */
  if (
    q.includes('rain') ||
    q.includes('rainfall') ||
    q.includes('umbrella') ||
    q.includes('raincoat') ||
    q.includes('shower') ||
    q.includes('downpour') ||
    q.includes('precipitation') ||
    q.includes('drizzle')
  ) {
    return 'RAIN_FORECAST';
  }


  /*
   * 9. Temperature
   */
  if (
    q.includes('temperature') ||
    q.includes('temp') ||
    q.includes('hot') ||
    q.includes('cold') ||
    q.includes('celsius') ||
    q.includes('fahrenheit') ||
    q.includes('degree') ||
    q.includes('cooler') ||
    q.includes('hotter')
  ) {
    return 'TEMPERATURE';
  }


  /*
   * 10. Wind
   */
  if (
    q.includes('wind') ||
    q.includes('windy') ||
    q.includes('gust') ||
    q.includes('breeze')
  ) {
    return 'WIND';
  }


  /*
   * 11. Forecast
   */
  if (
    q.includes('forecast') ||
    q.includes('tomorrow') ||
    q.includes('next week') ||
    q.includes('weekend') ||
    q.includes('next few days')
  ) {
    return 'WEATHER_FORECAST';
  }


  /*
   * 12. Current / now
   */
  if (
    q.includes('right now') ||
    q.includes('currently') ||
    q.includes('current weather') ||
    q.includes('outside now') ||
    q.includes('outside right now') ||
    q.includes('now') ||
    q.includes('outside')
  ) {
    return 'CURRENT_WEATHER';
  }


  /*
   * 13. General weather
   */
  if (
    q.includes('weather') ||
    q.includes('how is') ||
    q.includes('how are') ||
    q.includes('what is the weather') ||
    q.includes('what’s the weather') ||
    q.includes("what's the weather")
  ) {
    return 'GENERAL_WEATHER';
  }


  /*
   * 14. Unknown is retained as a classification value,
   * but the pipeline should NOT stop just because it is UNKNOWN.
   */
  return 'UNKNOWN';
}


/**
 * Location extraction.
 *
 * The parser recognizes common English + Indian-language location names.
 * Unknown locations can still be passed to the weather location search
 * when they appear in natural phrases.
 */
function extractLocationsFromQuery(
  query: string
): {
  locationReference?: string;
  secondaryLocationReference?: string;
} {
  const q = query.trim();
  const lower = q.toLowerCase();


  /*
   * Comparisons
   */
  const dualMatch =
    query.match(
      /compare\s+([A-Za-z\s]+?)\s+(?:and|vs|versus)\s+([A-Za-z\s]+)/i
    ) ||
    query.match(
      /between\s+([A-Za-z\s]+?)\s+and\s+([A-Za-z\s]+)/i
    );

  if (dualMatch) {
    const locA = cleanLocationName(dualMatch[1]);
    const locB = cleanLocationName(dualMatch[2]);

    if (locA && locB) {
      return {
        locationReference: locA,
        secondaryLocationReference: locB
      };
    }
  }


  /*
   * Major Indian / international locations.
   *
   * Regional scripts are included so the selected-language experience
   * does not depend on English city names.
   */
  const locationAliases: Array<{
    aliases: string[];
    name: string;
  }> = [

    {
      aliases: ['melbourne'],
      name: 'Melbourne'
    },
    {
      aliases: ['sydney'],
      name: 'Sydney'
    },
    {
      aliases: ['london'],
      name: 'London'
    },
    {
      aliases: ['dubai'],
      name: 'Dubai'
    },
    {
      aliases: ['singapore'],
      name: 'Singapore'
    },
    {
      aliases: ['new york'],
      name: 'New York'
    },

    {
      aliases: [
        'hyderabad',
        'హైదరాబాద్',
        'హైదరాబాద్లో'
      ],
      name: 'Hyderabad'
    },
    {
      aliases: [
        'chennai',
        'చెన్నై',
        'சென்னை',
        'चेन्नई',
        'ಚೆನ್ನೈ',
        'ചെന്നൈ'
      ],
      name: 'Chennai'
    },
    {
      aliases: [
        'bengaluru',
        'bangalore',
        'బెంగళూరు',
        'ಬೆಂಗಳೂರು',
        'பெங்களூரு',
        'बेंगलुरु',
        'ബെംഗളൂരു'
      ],
      name: 'Bengaluru'
    },
    {
      aliases: [
        'mumbai',
        'ముంబై',
        'मुंबई',
        'மும்பை',
        'ಮುಂಬೈ',
        'മുംബൈ'
      ],
      name: 'Mumbai'
    },
    {
      aliases: [
        'delhi',
        'new delhi',
        'ఢిల్లీ',
        'दिल्ली',
        'டெல்லி',
        'ದೆಹಲಿ',
        'ഡൽഹി'
      ],
      name: 'Delhi'
    },
    {
      aliases: [
        'pune',
        'పూణే',
        'पुणे',
        'புனே',
        'ಪುಣೆ',
        'പൂനെ'
      ],
      name: 'Pune'
    },
    {
      aliases: [
        'vijayawada',
        'విజయవాడ',
        'विजयवाड़ा',
        'விஜயவாடா',
        'ವಿಜಯವಾಡ',
        'വിജയവാഡ'
      ],
      name: 'Vijayawada'
    },
    {
      aliases: [
        'visakhapatnam',
        'vizag',
        'విశాఖపట్నం',
        'विशाखापत्तनम',
        'விசாகப்பட்டினம்',
        'ವಿಶಾಖಪಟ್ಟಣ',
        'വിശാഖപട്ടണം'
      ],
      name: 'Visakhapatnam'
    },
    {
      aliases: [
        'tirupati',
        'తిరుపతి',
        'तिरुपति',
        'திருப்பதி',
        'ತಿರುಪತಿ',
        'തിരുപ്പതി'
      ],
      name: 'Tirupati'
    },
    {
      aliases: [
        'coimbatore',
        'கோயம்புத்தூர்',
        'கோயம்புத்தூரில்',
        'கோவை',
        'கோவையில்',
        'கோயம்புத்தூர்',
        'കോയമ്പത്തൂർ',
        'कोयंबटूर',
        'ಕೊಯಮತ್ತೂರು'
      ],
      name: 'Coimbatore'
    }
  ];


  for (const location of locationAliases) {
    for (const alias of location.aliases) {
      if (lower.includes(alias.toLowerCase())) {
        return {
          locationReference: location.name
        };
      }
    }
  }


  /*
   * Natural English location phrases.
   *
   * Examples:
   * "weather in Melbourne"
   * "can I go to Melbourne"
   * "weather for Chennai"
   */
  const patterns = [
    /\bin\s+([A-Za-z][A-Za-z\s-]{1,60}?)(?=\s+(?:today|tomorrow|now|tonight|this|next|at)\b|[?.!,]|$)/i,

    /\bto\s+([A-Za-z][A-Za-z\s-]{1,60}?)(?=\s+(?:today|tomorrow|now|tonight|this|next|at)\b|[?.!,]|$)/i,

    /\bfor\s+([A-Za-z][A-Za-z\s-]{1,60}?)(?=\s+(?:today|tomorrow|now|tonight|this|next|at)\b|[?.!,]|$)/i
  ];


  for (const pattern of patterns) {
    const match = query.match(pattern);

    if (match?.[1]) {
      const location = cleanLocationName(match[1]);

      if (
        location &&
        !isNonLocationPhrase(location)
      ) {
        return {
          locationReference: location
        };
      }
    }
  }


  /*
   * Current location
   */
  if (
    lower.includes('here') ||
    lower.includes('my location') ||
    lower.includes('current location') ||
    lower.includes('నా ప్రాంతం') ||
    lower.includes('मेरी जगह') ||
    lower.includes('என் இடம்') ||
    lower.includes('ನನ್ನ ಸ್ಥಳ') ||
    lower.includes('എന്റെ സ്ഥലം')
  ) {
    return {
      locationReference: 'current_location'
    };
  }


  return {};
}


/**
 * Removes words that are not part of the location.
 */
function cleanLocationName(value: string): string {
  return value
    .replace(
      /\b(weather|forecast|today|tomorrow|now|tonight|historically|history|weather forecast)\b/gi,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim();
}


function isNonLocationPhrase(value: string): boolean {
  const lower = value.toLowerCase();

  return (
    lower === 'my area' ||
    lower === 'the morning' ||
    lower === 'the evening' ||
    lower === 'the afternoon' ||
    lower === 'cricket' ||
    lower === 'football' ||
    lower === 'travel' ||
    lower === 'outside'
  );
}


/**
 * Date extraction.
 *
 * Supports English and the major selected languages.
 */
function extractDateFromQuery(q: string): string {

  if (
    q.includes('tomorrow') ||
    q.includes('రేపు') ||
    q.includes('repu') ||
    q.includes('kal') ||
    q.includes('कल') ||
    q.includes('naalaikku') ||
    q.includes('நாளை') ||
    q.includes('ನಾಳೆ') ||
    q.includes('നാളെ')
  ) {
    return 'Tomorrow';
  }


  if (
    q.includes('today') ||
    q.includes('ఈ రోజు') ||
    q.includes('నేడు') ||
    q.includes('ee roju') ||
    q.includes('aaj') ||
    q.includes('आज') ||
    q.includes('இன்று') ||
    q.includes('இன்னைக்கு') ||
    q.includes('ಇಂದು') ||
    q.includes('ഇന്ന്') ||
    q.includes('tonight') ||
    q.includes('now')
  ) {
    return 'Today';
  }


  if (
    q.includes('weekend') ||
    q.includes('வார இறுதி') ||
    q.includes('వీకెండ్') ||
    q.includes('सप्ताहांत') ||
    q.includes('ವಾರಾಂತ್ಯ') ||
    q.includes('വാരാന്ത്യം')
  ) {
    return 'This Weekend';
  }


  if (
    q.includes('last year') ||
    q.includes('గత సంవత్సరం') ||
    q.includes('पिछले साल') ||
    q.includes('கடந்த ஆண்டு') ||
    q.includes('ಕಳೆದ ವರ್ಷ') ||
    q.includes('കഴിഞ്ഞ വർഷം')
  ) {
    return 'Last Year';
  }


  if (
    q.includes('past month') ||
    q.includes('this month') ||
    q.includes('గత నెల') ||
    q.includes('इस महीने') ||
    q.includes('கடந்த மாதம்') ||
    q.includes('ಕಳೆದ ತಿಂಗಳು') ||
    q.includes('കഴിഞ്ഞ മാസം')
  ) {
    return 'This Month';
  }


  return 'today';
}


/**
 * Time extraction.
 */
function extractTimeFromQuery(q: string): string {

  if (
    q.includes('morning') ||
    q.includes('ఉదయం') ||
    q.includes('udayam') ||
    q.includes('subah') ||
    q.includes('सुबह') ||
    q.includes('காலை') ||
    q.includes('காலையில்') ||
    q.includes('ಬೆಳಗ್ಗೆ') ||
    q.includes('രാവിലെ')
  ) {
    return 'Morning';
  }


  if (
    q.includes('afternoon') ||
    q.includes('మధ్యాహ్నం') ||
    q.includes('dopahar') ||
    q.includes('दोपहर') ||
    q.includes('மதியம்') ||
    q.includes('ಮಧ್ಯಾಹ್ನ') ||
    q.includes('ഉച്ചയ്ക്ക്')
  ) {
    return 'Afternoon';
  }


  if (
    q.includes('evening') ||
    q.includes('సాయంత్రం') ||
    q.includes('sayanthram') ||
    q.includes('shaam') ||
    q.includes('शाम') ||
    q.includes('மாலை') ||
    q.includes('மாலையில்') ||
    q.includes('ಸಂಜೆ') ||
    q.includes('വൈകുന്നേരം') ||
    q.includes('tonight')
  ) {
    return 'Evening';
  }


  if (
    q.includes('night') ||
    q.includes('రాత్రి') ||
    q.includes('raatri') ||
    q.includes('रात') ||
    q.includes('இரவு') ||
    q.includes('ರಾತ್ರಿ') ||
    q.includes('രാത്രി')
  ) {
    return 'Night';
  }


  const timeMatch =
    q.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);

  if (timeMatch) {
    return `${timeMatch[1]}${timeMatch[3].toUpperCase()}`;
  }


  return 'now';
}


/**
 * Explicit activity extraction.
 *
 * IMPORTANT:
 *
 * There is NO generic:
 *
 *     "play" -> cricket
 *
 * anymore.
 *
 * This prevents:
 *
 * "Can I play outside?"
 *
 * from becoming:
 *
 * "Cricket risk assessment"
 */
function extractActivityFromQuery(
  q: string
): ActivityConfig | undefined {

  if (
    q.includes('cricket') ||
    q.includes('క్రికెట్') ||
    q.includes('क्रिकेट') ||
    q.includes('கிரிக்கெட்') ||
    q.includes('ಕ್ರಿಕೆಟ್') ||
    q.includes('ക്രിക്കറ്റ്')
  ) {
    return ACTIVITIES_CONFIG.cricket;
  }


  if (
    q.includes('football') ||
    q.includes('ఫుట్‌బాల్') ||
    q.includes('फुटबॉल') ||
    q.includes('கால்பந்து') ||
    q.includes('ಫುಟ್ಬಾಲ್') ||
    q.includes('ഫുട്ബോൾ')
  ) {
    return ACTIVITIES_CONFIG.football;
  }


  if (
    q.includes('running') ||
    q.includes('run ') ||
    q.includes('jog') ||
    q.includes('పరుగు') ||
    q.includes('రన్నింగ్') ||
    q.includes('दौड़') ||
    q.includes('दौड़ना') ||
    q.includes('ஓட்டம்') ||
    q.includes('ಓಟ') ||
    q.includes('ഓട്ടം')
  ) {
    return ACTIVITIES_CONFIG.running;
  }


  if (
    q.includes('cycling') ||
    q.includes('cyclist') ||
    q.includes('bicycle') ||
    q.includes('సైక్లింగ్') ||
    q.includes('साइकिल') ||
    q.includes('சைக்கிள்') ||
    q.includes('ಸೈಕ್ಲಿಂಗ್') ||
    q.includes('സൈക്ലിംഗ്')
  ) {
    return ACTIVITIES_CONFIG.cycling;
  }


  if (
    q.includes('walking') ||
    q.includes('walk ') ||
    q.includes('వాకింగ్') ||
    q.includes('चलना') ||
    q.includes('நட') ||
    q.includes('ನಡೆಯ') ||
    q.includes('നടക്ക')
  ) {
    return ACTIVITIES_CONFIG.walking;
  }


  if (
    q.includes('hiking') ||
    q.includes('hike ') ||
    q.includes('trek') ||
    q.includes('ట్రెక్') ||
    q.includes('ट्रेक') ||
    q.includes('மலை நடை') ||
    q.includes('ಟ್ರೆಕ್') ||
    q.includes('ട്രെക്കിംഗ്')
  ) {
    return ACTIVITIES_CONFIG.hiking;
  }


  if (
    q.includes('camping') ||
    q.includes('camp ') ||
    q.includes('క్యాంపింగ్') ||
    q.includes('कैंपिंग') ||
    q.includes('முகாம்') ||
    q.includes('ಕ್ಯಾಂಪಿಂಗ್') ||
    q.includes('ക്യാമ്പിംഗ്')
  ) {
    return ACTIVITIES_CONFIG.camping;
  }


  if (
    q.includes('beach') ||
    q.includes('బీచ్') ||
    q.includes('समुद्र तट') ||
    q.includes('கடற்கரை') ||
    q.includes('ಬೀಚ್') ||
    q.includes('ബീച്ച്')
  ) {
    return ACTIVITIES_CONFIG.beach_visit;
  }


  if (
    q.includes('picnic') ||
    q.includes('పిక్నిక్') ||
    q.includes('पिकनिक') ||
    q.includes('சுற்றுலா') ||
    q.includes('ಪಿಕ್ನಿಕ್') ||
    q.includes('പിക്നിക്')
  ) {
    return ACTIVITIES_CONFIG.picnic;
  }


  if (
    q.includes('construction') ||
    q.includes('construct') ||
    q.includes('నిర్మాణం') ||
    q.includes('निर्माण') ||
    q.includes('கட்டுமானம்') ||
    q.includes('ನಿರ್ಮಾಣ') ||
    q.includes('നിർമ്മാണം')
  ) {
    return ACTIVITIES_CONFIG.construction;
  }


  if (
    q.includes('wedding') ||
    q.includes('party') ||
    q.includes('event') ||
    q.includes('function') ||
    q.includes('ఫంక్షన్') ||
    q.includes('ఈవెంట్') ||
    q.includes('शादी') ||
    q.includes('कार्यक्रम') ||
    q.includes('திருமணம்') ||
    q.includes('நிகழ்வு') ||
    q.includes('ಮದುವೆ') ||
    q.includes('ಕಾರ್ಯಕ್ರಮ') ||
    q.includes('വിവാഹം')
  ) {
    return ACTIVITIES_CONFIG.outdoor_event;
  }


  if (
    q.includes('college') ||
    q.includes('school') ||
    q.includes('కాలేజ్') ||
    q.includes('స్కూల్') ||
    q.includes('कॉलेज') ||
    q.includes('स्कूल') ||
    q.includes('கல்லூரி') ||
    q.includes('பள்ளி') ||
    q.includes('ಕಾಲೇಜು') ||
    q.includes('ಶಾಲೆ') ||
    q.includes('കോളേജ്') ||
    q.includes('സ്കൂൾ')
  ) {
    return ACTIVITIES_CONFIG.school_event;
  }


  if (
    q.includes('farm') ||
    q.includes('farming') ||
    q.includes('agriculture') ||
    q.includes('crop') ||
    q.includes('వ్యవసాయం') ||
    q.includes('పంట') ||
    q.includes('कृषि') ||
    q.includes('फसल') ||
    q.includes('விவசாயம்') ||
    q.includes('பயிர்') ||
    q.includes('ಕೃಷಿ') ||
    q.includes('ಬೆಳೆ') ||
    q.includes('കൃഷി') ||
    q.includes('വിള')
  ) {
    return ACTIVITIES_CONFIG.outdoor_work;
  }


  if (
    q.includes('drive') ||
    q.includes('road trip') ||
    q.includes('travel') ||
    q.includes('trip') ||
    q.includes('road travel') ||
    q.includes('ప్రయాణం') ||
    q.includes('यात्रा') ||
    q.includes('பயணம்') ||
    q.includes('ಪ್ರಯಾಣ') ||
    q.includes('യാത്ര')
  ) {
    return ACTIVITIES_CONFIG.road_travel;
  }


  if (
    q.includes('bike') ||
    q.includes('motorcycle') ||
    q.includes('ride') ||
    q.includes('రైడ్') ||
    q.includes('बाइक') ||
    q.includes('சைக்கிள்') ||
    q.includes('ಬೈಕ್') ||
    q.includes('റൈഡ്')
  ) {
    return ACTIVITIES_CONFIG.bike_ride;
  }


  if (
    q.includes('photography') ||
    q.includes('photo') ||
    q.includes('sightseeing') ||
    q.includes('visit') ||
    q.includes('సందర్శన') ||
    q.includes('फोटोग्राफी') ||
    q.includes('दर्शन') ||
    q.includes('புகைப்படம்') ||
    q.includes('சுற்றுலா') ||
    q.includes('ಛಾಯಾಗ್ರಹಣ') ||
    q.includes('സന്ദർശനം')
  ) {
    return ACTIVITIES_CONFIG.photography;
  }


  /*
   * Do NOT interpret generic "play" as Cricket.
   *
   * Do NOT interpret generic "outside" as an activity.
   *
   * Do NOT inherit an activity from conversation memory here.
   */
  return undefined;
}


/**
 * Some explicit activity questions benefit from clarification.
 *
 * Generic outdoor questions do NOT.
 */
function isExplicitlyTimeSensitiveActivityQuestion(
  q: string
): boolean {

  return (
    q.includes('cricket') ||
    q.includes('football') ||
    q.includes('running') ||
    q.includes('cycling') ||
    q.includes('hiking') ||
    q.includes('camping') ||
    q.includes('picnic') ||
    q.includes('beach') ||
    q.includes('wedding') ||
    q.includes('event') ||
    q.includes('construction')
  );
}
