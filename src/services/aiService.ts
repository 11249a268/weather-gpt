/**
 * WeatherGPT Dynamic Weather-Aware AI Service
 * Analyzes natural language user questions using empirical live telemetry
 * fetched from weatherService (Open-Meteo).
 */

import { detectIntent, extractTimeReference } from '../utils/nlpParser';
import { WeatherIntent, TimeReference, WeatherContext, DebugInfo } from '../types/chatContext';
import { AlertContext, AlertSeverity } from '../types/alert';
import { getAlertsForLocation } from './alertService';
import {
  getWeatherContext,
  LocationWeatherContext
} from './weatherService';
import { LocationSearchResult } from './weatherProviders/openMeteoProvider';
import { MOCK_AI_RECOMMENDATION, MOCK_RISK_ANALYSIS, AIRecommendation, RiskAnalysis } from '../data/mockWeatherData';

export interface WhyFactor {
  factorName: string;
  value: string;
  status: 'safe' | 'warning' | 'danger';
}

export interface StructuredAIResponse {
  id: string;
  query: string;
  title: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  riskScore: number; // 0 - 100
  locationName: string;
  weatherSummary: string;
  timeWindow: string;
  recommendation: string;
  whyExplanation: string;
  whyFactors: WhyFactor[];
  followUpSuggestions: string[];
  timestamp: string;
  debugInfo?: DebugInfo;
}

import { analyzeWeatherDecision, compareTimePeriods, DecisionResult } from './decisionService';

// Requirement 20: Lightweight Session Memory for Follow-up Context
let lastDecisionContext: {
  activity: string;
  dateStr: string;
  timeInput: string;
} | null = null;

/**
 * WEATHER-AWARE DYNAMIC AI RESPONSE GENERATOR
 * Requirement 17 & Step 4: Weather + Alert Combination Intelligence
 */
export async function generateWeatherResponse(
  queryText: string,
  context: WeatherContext,
  alertContext?: AlertContext
): Promise<StructuredAIResponse> {
  const intent: WeatherIntent = detectIntent(queryText);
  const timeRef: TimeReference = extractTimeReference(queryText);

  // Retrieve alert context for location if not provided
  let alertCtx = alertContext;
  if (!alertCtx) {
    try {
      const locObj: LocationSearchResult = {
        id: Date.now(),
        name: context.location.name,
        latitude: context.location.latitude,
        longitude: context.location.longitude,
        country: context.location.country || 'India',
        admin1: context.location.admin1 || '',
        timezone: 'Asia/Kolkata'
      };
      alertCtx = await getAlertsForLocation(locObj);
    } catch {
      alertCtx = undefined;
    }
  }

  // 1. Compute Period-Specific Weather Parameters from real context
  const metrics = computeTargetMetrics(context, timeRef, queryText);

  // 2. Compute Dynamic Risk Score & Level from empirical data & alerts
  const { riskScore, riskLevel } = calculateDynamicRisk(
    metrics.rainProb,
    metrics.windSpeed,
    metrics.temp,
    alertCtx?.highestSeverity
  );

  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 3. Synthesize Contextual Title, Summary, Recommendation & Factors
  const responseData = generateContextualContent(
    queryText,
    intent,
    timeRef,
    context,
    metrics,
    riskScore,
    riskLevel,
    alertCtx
  );

  const debugInfo: DebugInfo = {
    locationName: `${context.location.name}${context.location.admin1 ? `, ${context.location.admin1}` : ''}`,
    coordinates: `${context.location.latitude.toFixed(4)}, ${context.location.longitude.toFixed(4)}`,
    intent,
    timePeriod: timeRef.label,
    provider: `${context.provider || 'Open-Meteo'} + ${alertCtx?.provider || 'Alert Service'}`,
    retrievedAt: context.retrievedAt,
    isCached: context.isCached,
    cachedAt: context.cachedAt
  };

  return {
    id: `ai-resp-${Date.now()}`,
    query: queryText,
    title: responseData.title,
    riskLevel,
    riskScore,
    locationName: `${context.location.name}${context.location.admin1 ? `, ${context.location.admin1}` : ''}`,
    weatherSummary: responseData.weatherSummary,
    timeWindow: timeRef.label,
    recommendation: responseData.recommendation,
    whyExplanation: responseData.whyExplanation,
    whyFactors: responseData.whyFactors,
    followUpSuggestions: responseData.followUpSuggestions,
    timestamp: nowStr,
    debugInfo
  };
}

/**
 * Entrypoint wrapper used by ChatContainer
 */
export async function generateMockAIResponse(
  queryText: string,
  targetLocation?: LocationSearchResult
): Promise<StructuredAIResponse> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const intent = detectIntent(queryText);
  const timeRef = extractTimeReference(queryText);

  const context = await getWeatherContext(targetLocation, intent, timeRef.label);

  const locObj: LocationSearchResult = targetLocation || {
    id: Date.now(),
    name: context.location.name,
    latitude: context.location.latitude,
    longitude: context.location.longitude,
    country: context.location.country || 'India',
    admin1: context.location.admin1 || '',
    timezone: 'Asia/Kolkata'
  };

  const alertCtx = await getAlertsForLocation(locObj);

  return await generateWeatherResponse(queryText, context, alertCtx);
}

/**
 * Target Metrics Calculator
 * Extracts precise numbers based on requested time horizon (now, next 3 hours, tomorrow morning, etc.)
 */
function computeTargetMetrics(context: WeatherContext, timeRef: TimeReference, queryText: string) {
  const current = context.current;
  const hourly = context.hourly || [];
  const daily = context.daily || [];

  if (!current) {
    return {
      temp: 0,
      feelsLike: 0,
      rainProb: 0,
      windSpeed: 0,
      condition: 'Unavailable',
      humidity: 0,
      high: 0,
      low: 0,
      unavailable: true
    };
  }

  // Next 3 hours horizon
  if (timeRef.period === 'next_3_hours') {
    const next3 = hourly.slice(0, 3);
    const maxRainProb = next3.length > 0
      ? Math.max(...next3.map((h) => h.precipitationProbability))
      : current.precipitation;
    const maxWind = next3.length > 0
      ? Math.max(...next3.map((h) => h.windSpeed))
      : current.windSpeed;
    const avgTemp = next3.length > 0
      ? Math.round(next3.reduce((acc, h) => acc + h.temp, 0) / next3.length)
      : current.temperature;

    return {
      temp: avgTemp,
      feelsLike: current.feelsLike,
      rainProb: maxRainProb,
      windSpeed: maxWind,
      condition: next3[0]?.conditionCode || current.weatherCondition,
      humidity: current.humidity,
      high: current.high,
      low: current.low,
      unavailable: false
    };
  }

  // Tomorrow Morning / Afternoon / Evening / Full Day
  if (
    timeRef.period === 'tomorrow_morning' ||
    timeRef.period === 'tomorrow_afternoon' ||
    timeRef.period === 'tomorrow_evening' ||
    timeRef.period === 'tomorrow_full'
  ) {
    const tomorrowDaily = daily[1] || daily[0];

    // Filter hourly entries for tomorrow if available (indices 24 to 48 roughly)
    const tomorrowHourly = hourly.length >= 24 ? hourly.slice(24, 48) : [];
    
    let targetHourly = tomorrowHourly;
    if (timeRef.period === 'tomorrow_morning') {
      targetHourly = tomorrowHourly.slice(6, 12);
    } else if (timeRef.period === 'tomorrow_afternoon') {
      targetHourly = tomorrowHourly.slice(12, 17);
    } else if (timeRef.period === 'tomorrow_evening') {
      targetHourly = tomorrowHourly.slice(17, 22);
    }

    const rainProb = targetHourly.length > 0
      ? Math.max(...targetHourly.map((h) => h.precipitationProbability))
      : (tomorrowDaily?.rainProbability ?? current.precipitation);

    const temp = targetHourly.length > 0
      ? Math.round(targetHourly.reduce((acc, h) => acc + h.temp, 0) / targetHourly.length)
      : (tomorrowDaily?.high ?? current.high);

    const windSpeed = targetHourly.length > 0
      ? Math.max(...targetHourly.map((h) => h.windSpeed))
      : current.windSpeed;

    return {
      temp,
      feelsLike: temp + 1,
      rainProb,
      windSpeed,
      condition: tomorrowDaily?.condition || current.weatherCondition,
      humidity: current.humidity,
      high: tomorrowDaily?.high ?? current.high,
      low: tomorrowDaily?.low ?? current.low,
      unavailable: false
    };
  }

  // Default 'now' / 'today'
  return {
    temp: current.temperature,
    feelsLike: current.feelsLike,
    rainProb: current.precipitation,
    windSpeed: current.windSpeed,
    condition: current.weatherCondition,
    humidity: current.humidity,
    high: current.high,
    low: current.low,
    unavailable: false
  };
}

/**
 * Calculates Risk Score (0 - 100) dynamically from rain, wind, temp, and alert severity
 */
function calculateDynamicRisk(
  rainProb: number,
  windSpeed: number,
  temp: number,
  highestAlertSeverity?: AlertSeverity
): { riskScore: number; riskLevel: 'LOW' | 'MODERATE' | 'HIGH' } {
  let score = Math.round(rainProb * 0.7 + Math.min(windSpeed * 1.2, 25));
  if (temp > 38 || temp < 10) score += 10;

  // Elevate score based on official warning severity
  if (highestAlertSeverity === 'RED') score = Math.max(score, 88);
  else if (highestAlertSeverity === 'ORANGE') score = Math.max(score, 72);
  else if (highestAlertSeverity === 'YELLOW') score = Math.max(score, 45);

  score = Math.max(10, Math.min(98, score));

  let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
  if (score >= 70) riskLevel = 'HIGH';
  else if (score >= 40) riskLevel = 'MODERATE';

  return { riskScore: score, riskLevel };
}

/**
 * Generates tailored, non-generic response content driven strictly by real weather context & alert context
 */
function generateContextualContent(
  query: string,
  intent: WeatherIntent,
  timeRef: TimeReference,
  context: WeatherContext,
  m: ReturnType<typeof computeTargetMetrics>,
  riskScore: number,
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH',
  alertCtx?: AlertContext
): {
  title: string;
  weatherSummary: string;
  recommendation: string;
  whyExplanation: string;
  whyFactors: WhyFactor[];
  followUpSuggestions: string[];
} {
  const loc = context.location;
  const locStr = `${loc.name}${loc.admin1 ? `, ${loc.admin1}` : ''}`;
  const q = query.toLowerCase();

  // Handle missing data scenario (Requirement 10)
  if (m.unavailable) {
    return {
      title: `Weather Query for ${locStr}`,
      weatherSummary: `Data Unavailable`,
      recommendation: `That information is currently unavailable for ${locStr}. Please verify location connection and try refreshing.`,
      whyExplanation: `Meteorological observation feeds could not retrieve complete data points for the requested time frame.`,
      whyFactors: [
        { factorName: 'Location', value: locStr, status: 'warning' },
        { factorName: 'Status', value: 'Information Unavailable', status: 'danger' }
      ],
      followUpSuggestions: ['What is the weather right now?', 'What is the temperature?']
    };
  }

  // DECISION ASSISTANT QUERY (Step 5 Requirement 18, 19 & 20)
  if (intent === 'DECISION_QUERY' || intent === 'TIME_COMPARISON_QUERY' || q.includes('can i') || q.includes('should i') || q.includes('good for') || q.includes('what about')) {
    let targetActivity = 'outdoor_sports';
    let dateStr = q.includes('tomorrow') ? 'Tomorrow' : 'Today';
    let timeInput = 'Afternoon';

    if (q.includes('cricket') || q.includes('football') || q.includes('sport') || q.includes('play')) targetActivity = 'outdoor_sports';
    else if (q.includes('bike') || q.includes('ride') || q.includes('cycling')) targetActivity = 'bike_ride';
    else if (q.includes('travel') || q.includes('commute') || q.includes('drive')) targetActivity = 'travel';
    else if (q.includes('event') || q.includes('college') || q.includes('party')) targetActivity = 'school_event';
    else if (q.includes('hike') || q.includes('walk') || q.includes('trek')) targetActivity = 'hiking';
    else if (q.includes('work') || q.includes('build')) targetActivity = 'outdoor_work';
    else if (lastDecisionContext) targetActivity = lastDecisionContext.activity;

    if (q.includes('morning')) timeInput = 'Morning';
    else if (q.includes('afternoon')) timeInput = 'Afternoon';
    else if (q.includes('evening') || q.includes('night')) timeInput = 'Evening';
    else if (lastDecisionContext) timeInput = lastDecisionContext.timeInput;

    if (!q.includes('tomorrow') && !q.includes('today') && lastDecisionContext) {
      dateStr = lastDecisionContext.dateStr;
    }

    lastDecisionContext = { activity: targetActivity, dateStr, timeInput };

    const actNameFormatted = targetActivity.replace('_', ' ').toUpperCase();
    const title = `Weather Risk Assessment for ${actNameFormatted} (${locStr})`;
    const summary = `Weather Risk: ${riskScore}/100 • ${riskLevel} RISK`;

    let rec = `Calculated ${riskLevel} weather risk (${riskScore}/100) for ${actNameFormatted.toLowerCase()} during ${dateStr} ${timeInput} in ${loc.name}. Rain chance is ${m.rainProb}% with ${m.windSpeed} km/h winds.`;

    if (alertCtx?.highestSeverity && alertCtx.highestSeverity !== 'GREEN') {
      rec += ` ⚠️ Official ${alertCtx.highestSeverity} warning active for ${loc.name}.`;
    }

    return {
      title,
      weatherSummary: summary,
      recommendation: rec,
      whyExplanation: `Activity risk score synthesizes precipitation probability (${m.rainProb}%), wind speed (${m.windSpeed} km/h), temperature (${m.temp}°C), and official district warning status.`,
      whyFactors: [
        { factorName: '📍 Location', value: locStr, status: 'safe' },
        { factorName: '🎯 Activity', value: targetActivity, status: 'safe' },
        { factorName: '🕒 Target Window', value: `${dateStr} ${timeInput}`, status: 'safe' },
        { factorName: '📊 Calculated Risk Score', value: `${riskScore}/100 (${riskLevel})`, status: riskLevel === 'HIGH' ? 'danger' : 'warning' },
        { factorName: '🌧️ Rain Probability', value: `${m.rainProb}%`, status: m.rainProb > 50 ? 'warning' : 'safe' },
        { factorName: '⚠️ Warning Override', value: alertCtx?.highestSeverity || 'GREEN', status: alertCtx?.highestSeverity !== 'GREEN' ? 'warning' : 'safe' }
      ],
      followUpSuggestions: [
        `What about ${timeInput === 'Evening' ? 'morning' : 'evening'}?`,
        'How was this score calculated?',
        'Show me a better time window'
      ]
    };
  }
  if (intent === 'WARNING_QUERY' || q.includes('warning') || q.includes('alert') || q.includes('advisory')) {
    const activeAlert = alertCtx?.activeAlerts.find((a: any) => a.severity !== 'GREEN') || alertCtx?.activeAlerts?.[0];
    const hasActive = activeAlert && activeAlert.severity !== 'GREEN';

    let title = `Official Weather Warning Analysis for ${locStr}`;
    let weatherSummary = hasActive
      ? `${activeAlert.severity} ALERT • ${activeAlert.eventTypeName} • Rain Risk: ${m.rainProb}%`
      : `GREEN — No Active Warning • Rain Risk: ${m.rainProb}%`;

    let recommendation = '';
    let explanation = '';

    if (q.includes('why')) {
      title = `Alert Rationale for ${locStr}`;
      recommendation = hasActive
        ? `You are seeing this alert because your selected location (${loc.name}) falls within the designated ${activeAlert.severity} warning zone for ${activeAlert.eventTypeName || activeAlert.eventType} valid from ${activeAlert.validFrom} to ${activeAlert.validUntil}. Issued by ${activeAlert.source}.`
        : `No severe weather warning is currently active for ${loc.name}. Your location is under GREEN status (no active meteorological warnings).`;
      explanation = hasActive ? activeAlert.whyExplanation || activeAlert.description : `No warning polygon overlaps with ${loc.name} coordinates at this time.`;
    } else if (q.includes('serious') || q.includes('severity')) {
      title = `Warning Severity Assessment for ${locStr}`;
      recommendation = hasActive
        ? `The active warning for ${loc.name} is classified as ${activeAlert.severity} severity (${activeAlert.eventTypeName}). ${
            activeAlert.severity === 'RED'
              ? 'RED WARNING: Extreme risk — take immediate action and follow emergency guidelines.'
              : activeAlert.severity === 'ORANGE'
              ? 'ORANGE ALERT: Elevated risk — prepare and take necessary precautions.'
              : 'YELLOW WATCH: Moderate risk — stay aware and monitor official updates.'
          }`
        : `There are currently no serious weather warnings in effect for ${loc.name} (GREEN status).`;
      explanation = `Warning levels follow official severity definitions: RED (Take Action), ORANGE (Be Prepared), YELLOW (Be Updated), GREEN (No Warning).`;
    } else if (q.includes('travel')) {
      title = `Travel Risk under Weather Warning for ${locStr}`;
      recommendation = hasActive
        ? `An ${activeAlert.severity} Alert is active for ${loc.name} due to ${activeAlert.eventTypeName}. Combined with ${m.rainProb}% rain probability and ${m.windSpeed} km/h winds, consider postponing non-essential travel during the warning period (${activeAlert.validFrom} – ${activeAlert.validUntil}).`
        : `No weather warning is active for ${loc.name}. Travel conditions are clear with low rain risk (${m.rainProb}%).`;
      explanation = `Travel guidance synthesizes official ${hasActive ? activeAlert.severity : 'GREEN'} warning status with live telemetry (${m.rainProb}% rain chance, ${m.windSpeed} km/h wind).`;
    } else if (q.includes('end') || q.includes('until') || q.includes('time')) {
      title = `Warning Validity Horizon for ${locStr}`;
      recommendation = hasActive
        ? `The active ${activeAlert.severity} warning for ${loc.name} is valid from ${activeAlert.validFrom} until ${activeAlert.validUntil}.`
        : `No active weather warning is in effect for ${loc.name}.`;
      explanation = `Official warning validity bounds are set by meteorological forecast models.`;
    } else {
      recommendation = hasActive
        ? `An active ${activeAlert.severity} warning (${activeAlert.title}) is in effect for ${loc.name} until ${activeAlert.validUntil}. Recommended action: ${activeAlert.recommendedAction}`
        : `No active severe weather warning has been detected for ${loc.name}. Weather is currently ${m.condition} at ${m.temp}°C with ${m.rainProb}% rain probability. Continue monitoring official updates.`;
      explanation = hasActive
        ? `Official ${activeAlert.source} feed reports ${activeAlert.severity} alert for ${loc.name}.`
        : `No official weather warnings currently match ${loc.name} coordinates.`;
    }

    return {
      title,
      weatherSummary,
      recommendation,
      whyExplanation: explanation,
      whyFactors: [
        { factorName: '📍 Location', value: locStr, status: 'safe' },
        { factorName: '⚠️ Warning Status', value: hasActive ? `${activeAlert.severity} (${activeAlert.eventTypeName})` : 'GREEN — NO WARNING', status: hasActive ? (activeAlert.severity === 'RED' ? 'danger' : 'warning') : 'safe' },
        { factorName: '🌧️ Rain Probability', value: `${m.rainProb}%`, status: m.rainProb > 50 ? 'warning' : 'safe' },
        { factorName: '💨 Wind Speed', value: `${m.windSpeed} km/h`, status: 'safe' },
        { factorName: '🕒 Validity Period', value: hasActive ? `${activeAlert.validFrom} – ${activeAlert.validUntil}` : 'Current', status: 'safe' },
        { factorName: '📋 Data Source', value: alertCtx?.provider || 'Alert Service', status: 'safe' }
      ],
      followUpSuggestions: [
        'Why am I getting this warning?',
        'Should I travel during this alert?',
        'What time will the warning end?'
      ]
    };
  }

  // 1. Temperature Query / Hotter Than Today
  if (intent === 'TEMPERATURE_QUERY' || q.includes('temp') || q.includes('hotter') || q.includes('celsius') || q.includes('degree')) {
    const isHotterQuery = q.includes('hotter');
    const tomorrowDaily = context.daily[1] || context.daily[0];
    const todayHigh = m.high;
    const tomorrowHigh = tomorrowDaily ? tomorrowDaily.high : todayHigh;

    let recommendation = `Current temperature in ${loc.name} is ${m.temp}°C (feels like ${m.feelsLike}°C). Today's temperature ranges from a low of ${m.low}°C to a high of ${m.high}°C with ${m.humidity}% humidity.`;
    
    if (isHotterQuery) {
      if (tomorrowHigh > todayHigh) {
        recommendation = `Yes, tomorrow will be hotter than today in ${loc.name}. Tomorrow's high is forecast at ${tomorrowHigh}°C compared to today's high of ${todayHigh}°C.`;
      } else if (tomorrowHigh < todayHigh) {
        recommendation = `No, tomorrow will not be hotter than today in ${loc.name}. Tomorrow's high is forecast at ${tomorrowHigh}°C, which is cooler than today's high of ${todayHigh}°C.`;
      } else {
        recommendation = `Tomorrow's temperature in ${loc.name} will be similar to today. Both days have a forecast high of ${todayHigh}°C.`;
      }
    }

    return {
      title: `Temperature Assessment for ${locStr}`,
      weatherSummary: `${m.temp}°C (${m.condition}) • Feels like ${m.feelsLike}°C • Today Range: ${m.low}°C - ${m.high}°C`,
      recommendation,
      whyExplanation: `Recorded air temperature stands at ${m.temp}°C with apparent heat index of ${m.feelsLike}°C. Relative humidity is ${m.humidity}%.`,
      whyFactors: [
        { factorName: '📍 Location', value: locStr, status: 'safe' },
        { factorName: '🕒 Forecast Time', value: timeRef.label, status: 'safe' },
        { factorName: '🌡️ Temperature', value: `${m.temp}°C (Feels ${m.feelsLike}°C)`, status: m.temp > 35 ? 'warning' : 'safe' },
        { factorName: '🌧️ Rain Probability', value: `${m.rainProb}%`, status: m.rainProb > 50 ? 'warning' : 'safe' },
        { factorName: '💨 Wind', value: `${m.windSpeed} km/h`, status: 'safe' },
        { factorName: '⚠️ Warning Status', value: riskLevel === 'HIGH' ? 'High Advisory' : 'Normal', status: riskLevel === 'HIGH' ? 'danger' : 'safe' }
      ],
      followUpSuggestions: [
        'Will it rain in the next 3 hours?',
        'What will the weather be tomorrow morning?',
        'Will tomorrow be hotter than today?'
      ]
    };
  }

  // 2. Rain Query / Umbrella
  if (intent === 'RAIN_QUERY' || q.includes('rain') || q.includes('umbrella') || q.includes('shower')) {
    const carriesUmbrella = m.rainProb >= 40;
    return {
      title: `Precipitation & Rain Analysis for ${locStr}`,
      weatherSummary: `${m.rainProb}% Rain Probability • Condition: ${m.condition}`,
      recommendation: carriesUmbrella
        ? `Rain probability is ${m.rainProb}% in ${loc.name} during ${timeRef.label}. Carry an umbrella or rain protection.`
        : `Rain probability is low at ${m.rainProb}% in ${loc.name} during ${timeRef.label}. You likely won't need an umbrella.`,
      whyExplanation: `Open-Meteo telemetry forecasts a ${m.rainProb}% chance of rainfall during ${timeRef.label} with wind speeds of ${m.windSpeed} km/h.`,
      whyFactors: [
        { factorName: '📍 Location', value: locStr, status: 'safe' },
        { factorName: '🕒 Forecast Time', value: timeRef.label, status: 'safe' },
        { factorName: '🌡️ Temperature', value: `${m.temp}°C`, status: 'safe' },
        { factorName: '🌧️ Rain Probability', value: `${m.rainProb}%`, status: m.rainProb > 60 ? 'danger' : m.rainProb > 30 ? 'warning' : 'safe' },
        { factorName: '💨 Wind', value: `${m.windSpeed} km/h`, status: 'safe' },
        { factorName: '⚠️ Warning Status', value: m.rainProb >= 70 ? 'Heavy Rain Warning' : 'Clear', status: m.rainProb >= 70 ? 'danger' : 'safe' }
      ],
      followUpSuggestions: [
        'Is it safe to travel now?',
        'What will the weather be tomorrow morning?',
        'What is the temperature right now?'
      ]
    };
  }

  // 3. Travel Decision / Safety
  if (intent === 'TRAVEL_DECISION' || q.includes('travel') || q.includes('safe') || q.includes('commute')) {
    return {
      title: `Commute & Travel Risk Assessment for ${locStr}`,
      weatherSummary: `${m.condition} • Rain Risk: ${m.rainProb}% • Wind: ${m.windSpeed} km/h`,
      recommendation: riskLevel === 'HIGH'
        ? `Travel in ${loc.name} carries HIGH risk during ${timeRef.label} due to a ${m.rainProb}% rain probability and ${m.windSpeed} km/h winds. Delay travel if possible.`
        : riskLevel === 'MODERATE'
        ? `Travel is manageable in ${loc.name} during ${timeRef.label}. Carry rain protection and exercise caution during commute.`
        : `Travel conditions in ${loc.name} are clear and safe during ${timeRef.label} with a low rain chance of ${m.rainProb}%.`,
      whyExplanation: `Evaluation combines ${m.rainProb}% precipitation probability, ${m.windSpeed} km/h wind speeds, and ${m.condition} weather condition.`,
      whyFactors: [
        { factorName: '📍 Location', value: locStr, status: 'safe' },
        { factorName: '🕒 Forecast Time', value: timeRef.label, status: 'safe' },
        { factorName: '🌡️ Temperature', value: `${m.temp}°C`, status: 'safe' },
        { factorName: '🌧️ Rain Probability', value: `${m.rainProb}%`, status: m.rainProb > 60 ? 'danger' : 'warning' },
        { factorName: '💨 Wind', value: `${m.windSpeed} km/h`, status: m.windSpeed > 30 ? 'danger' : 'safe' },
        { factorName: '⚠️ Warning Status', value: `${riskScore}/100 Index (${riskLevel})`, status: riskLevel === 'HIGH' ? 'danger' : riskLevel === 'MODERATE' ? 'warning' : 'safe' }
      ],
      followUpSuggestions: [
        'Will it rain in the next 3 hours?',
        'Should I carry an umbrella?',
        'What is the wind speed?'
      ]
    };
  }

  // 4. Outdoor Sports / Activity
  if (intent === 'OUTDOOR_ACTIVITY' || q.includes('cricket') || q.includes('sport') || q.includes('play')) {
    return {
      title: `Outdoor Sports Feasibility for ${locStr}`,
      weatherSummary: `${m.condition} • Rain Probability: ${m.rainProb}% • Temp: ${m.temp}°C`,
      recommendation: m.rainProb > 45
        ? `Unfavorable for outdoor sports in ${loc.name} during ${timeRef.label} due to a ${m.rainProb}% chance of rain. Wet grounds expected.`
        : `Favorable conditions for playing sports in ${loc.name} during ${timeRef.label} with ${m.temp}°C temperature and low rain risk (${m.rainProb}%).`,
      whyExplanation: `Sports feasibility requires low soil moisture and clear skies. Current rain probability is ${m.rainProb}% with ${m.windSpeed} km/h wind.`,
      whyFactors: [
        { factorName: '📍 Location', value: locStr, status: 'safe' },
        { factorName: '🕒 Forecast Time', value: timeRef.label, status: 'safe' },
        { factorName: '🌡️ Temperature', value: `${m.temp}°C`, status: 'safe' },
        { factorName: '🌧️ Rain Probability', value: `${m.rainProb}%`, status: m.rainProb > 45 ? 'danger' : 'safe' },
        { factorName: '💨 Wind', value: `${m.windSpeed} km/h`, status: 'safe' },
        { factorName: '⚠️ Warning Status', value: m.rainProb > 45 ? 'Play Interruption Likely' : 'Optimal', status: m.rainProb > 45 ? 'warning' : 'safe' }
      ],
      followUpSuggestions: [
        'What will the weather be tomorrow morning?',
        'Should I carry an umbrella?',
        'What is the wind speed?'
      ]
    };
  }

  // 5. Event Planning / Gathering
  if (intent === 'EVENT_PLANNING' || q.includes('event') || q.includes('college') || q.includes('gathering') || q.includes('conduct')) {
    return {
      title: `Event Planning & Outdoor Venue Advisory for ${locStr}`,
      weatherSummary: `Precipitation Risk: ${m.rainProb}% • ${m.condition} • Wind: ${m.windSpeed} km/h`,
      recommendation: m.rainProb > 50
        ? `Conducting an outdoor event in ${loc.name} during ${timeRef.label} carries disruption risk (${m.rainProb}% rain chance). Waterproof canopy recommended.`
        : `Conditions are suitable for conducting your event in ${loc.name} during ${timeRef.label}. Temperature is ${m.temp}°C with low rain risk (${m.rainProb}%).`,
      whyExplanation: `Event planning risk analysis factors in rainfall probability (${m.rainProb}%), ambient temperature (${m.temp}°C), and wind speed (${m.windSpeed} km/h).`,
      whyFactors: [
        { factorName: '📍 Location', value: locStr, status: 'safe' },
        { factorName: '🕒 Forecast Time', value: timeRef.label, status: 'safe' },
        { factorName: '🌡️ Temperature', value: `${m.temp}°C`, status: 'safe' },
        { factorName: '🌧️ Rain Probability', value: `${m.rainProb}%`, status: m.rainProb > 50 ? 'danger' : 'safe' },
        { factorName: '💨 Wind', value: `${m.windSpeed} km/h`, status: 'safe' },
        { factorName: '⚠️ Warning Status', value: m.rainProb > 50 ? 'Canopy Required' : 'Favorable', status: m.rainProb > 50 ? 'warning' : 'safe' }
      ],
      followUpSuggestions: [
        'What will the weather be tomorrow morning?',
        'Is it safe to travel now?',
        'Will it rain in the next 3 hours?'
      ]
    };
  }

  // 6. Farming / Agriculture
  if (intent === 'AGRICULTURE' || q.includes('crop') || q.includes('irrigate') || q.includes('water')) {
    return {
      title: `Agricultural & Irrigation Advisory for ${locStr}`,
      weatherSummary: `Rain Forecast: ${m.rainProb}% • Temp: ${m.temp}°C • Humidity: ${m.humidity}%`,
      recommendation: m.rainProb > 40
        ? `Hold artificial crop irrigation in ${loc.name} for ${timeRef.label}. Expected natural rainfall (${m.rainProb}% chance) will provide adequate soil moisture.`
        : `Proceed with standard crop irrigation in ${loc.name} for ${timeRef.label}. Rain probability is low at ${m.rainProb}%.`,
      whyExplanation: `Irrigation guidance calculates natural precipitation expectation (${m.rainProb}%), ambient temperature (${m.temp}°C), and relative humidity (${m.humidity}%).`,
      whyFactors: [
        { factorName: '📍 Location', value: locStr, status: 'safe' },
        { factorName: '🕒 Forecast Time', value: timeRef.label, status: 'safe' },
        { factorName: '🌡️ Temperature', value: `${m.temp}°C`, status: 'safe' },
        { factorName: '🌧️ Rain Probability', value: `${m.rainProb}%`, status: 'safe' },
        { factorName: '💨 Wind', value: `${m.windSpeed} km/h`, status: 'safe' },
        { factorName: '⚠️ Warning Status', value: m.rainProb > 40 ? 'Natural Moisture Expected' : 'Irrigation Needed', status: 'safe' }
      ],
      followUpSuggestions: [
        'Will it rain in the next 3 hours?',
        'What will the weather be tomorrow morning?',
        'What is the wind speed?'
      ]
    };
  }

  // 7. Daily Forecast (e.g. "What will the weather be tomorrow morning?")
  if (intent === 'DAILY_FORECAST' || timeRef.period.startsWith('tomorrow')) {
    return {
      title: `Forecast Analysis for ${locStr} (${timeRef.label})`,
      weatherSummary: `${m.temp}°C • ${m.condition} • Rain Risk: ${m.rainProb}% • Wind: ${m.windSpeed} km/h`,
      recommendation: `The weather in ${loc.name} during ${timeRef.label} will be ${m.condition} with a high of ${m.temp}°C and a ${m.rainProb}% chance of rain.`,
      whyExplanation: `Open-Meteo extended forecast projects ${m.temp}°C high temperature with ${m.rainProb}% rain probability and ${m.windSpeed} km/h wind.`,
      whyFactors: [
        { factorName: '📍 Location', value: locStr, status: 'safe' },
        { factorName: '🕒 Forecast Time', value: timeRef.label, status: 'safe' },
        { factorName: '🌡️ Temperature', value: `${m.temp}°C`, status: 'safe' },
        { factorName: '🌧️ Rain Probability', value: `${m.rainProb}%`, status: m.rainProb > 40 ? 'warning' : 'safe' },
        { factorName: '💨 Wind', value: `${m.windSpeed} km/h`, status: 'safe' },
        { factorName: '⚠️ Warning Status', value: riskLevel === 'HIGH' ? 'Moderate Risk' : 'Normal', status: riskLevel === 'HIGH' ? 'warning' : 'safe' }
      ],
      followUpSuggestions: [
        'Will tomorrow be hotter than today?',
        'Can I play cricket tomorrow evening?',
        'Should I carry an umbrella?'
      ]
    };
  }

  // 8. Hourly Forecast (e.g. "Will it rain in next 3 hours?")
  if (intent === 'HOURLY_FORECAST' || timeRef.period === 'next_3_hours') {
    return {
      title: `Hourly Weather Horizon for ${locStr}`,
      weatherSummary: `Next 3 Hours: ${m.temp}°C • Rain Risk: ${m.rainProb}% • Wind: ${m.windSpeed} km/h`,
      recommendation: `Over the next 3 hours in ${loc.name}, expects ${m.condition} with temperatures around ${m.temp}°C and a peak rain probability of ${m.rainProb}%.`,
      whyExplanation: `Short-term hourly forecast combines 3-hour precipitation probability (${m.rainProb}%) and wind telemetry (${m.windSpeed} km/h).`,
      whyFactors: [
        { factorName: '📍 Location', value: locStr, status: 'safe' },
        { factorName: '🕒 Forecast Time', value: timeRef.label, status: 'safe' },
        { factorName: '🌡️ Temperature', value: `${m.temp}°C`, status: 'safe' },
        { factorName: '🌧️ Rain Probability', value: `${m.rainProb}%`, status: m.rainProb > 50 ? 'danger' : 'safe' },
        { factorName: '💨 Wind', value: `${m.windSpeed} km/h`, status: 'safe' },
        { factorName: '⚠️ Warning Status', value: m.rainProb > 50 ? 'Rain Expected Soon' : 'Clear', status: m.rainProb > 50 ? 'warning' : 'safe' }
      ],
      followUpSuggestions: [
        'Is it safe to travel now?',
        'Should I carry an umbrella?',
        'What is the temperature right now?'
      ]
    };
  }

  // Default Current Weather / General Response
  return {
    title: `Live Weather Report for ${locStr}`,
    weatherSummary: `${m.temp}°C (${m.condition}) • Humidity ${m.humidity}% • Wind ${m.windSpeed} km/h`,
    recommendation: `The current weather in ${loc.name} is ${m.condition} with a temperature of ${m.temp}°C (feels like ${m.feelsLike}°C). Rain probability is ${m.rainProb}% and wind speed is ${m.windSpeed} km/h.`,
    whyExplanation: `Real-time Open-Meteo telemetry recorded ${m.temp}°C temperature, ${m.humidity}% humidity, ${m.windSpeed} km/h wind speed, and ${m.rainProb}% rain probability.`,
    whyFactors: [
      { factorName: '📍 Location', value: locStr, status: 'safe' },
      { factorName: '🕒 Forecast Time', value: timeRef.label, status: 'safe' },
      { factorName: '🌡️ Temperature', value: `${m.temp}°C (Feels ${m.feelsLike}°C)`, status: 'safe' },
      { factorName: '🌧️ Rain Probability', value: `${m.rainProb}%`, status: m.rainProb > 40 ? 'warning' : 'safe' },
      { factorName: '💨 Wind', value: `${m.windSpeed} km/h`, status: 'safe' },
      { factorName: '⚠️ Warning Status', value: riskLevel === 'HIGH' ? 'Advisory Active' : 'Normal', status: riskLevel === 'HIGH' ? 'danger' : 'safe' }
    ],
    followUpSuggestions: [
      'Will it rain in the next 3 hours?',
      'What is the temperature right now?',
      'Is it safe to travel now?'
    ]
  };
}

export async function fetchAIRecommendation(query?: string, activity?: string): Promise<{ recommendation: AIRecommendation; risk: RiskAnalysis }> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const customRec = { ...MOCK_AI_RECOMMENDATION };
  if (query) customRec.queryContext = query;
  if (activity) customRec.summary = `Risk assessment tailored for ${activity}: Weather disruption analysis completed based on live telemetry.`;
  return {
    recommendation: customRec,
    risk: MOCK_RISK_ANALYSIS
  };
}

export async function processVoiceInput(): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return 'Can I travel tomorrow morning?';
}

