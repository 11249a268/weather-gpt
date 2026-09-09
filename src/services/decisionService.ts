import { LocationSearchResult } from './weatherProviders/openMeteoProvider';
import { getWeatherContext } from './weatherService';
import { getAlertsForLocation } from './alertService';
import { ACTIVITIES_CONFIG, classifyActivityText, ActivityConfig, ActivityId } from '../config/activityConfig';
import { calculateActivityRisk, RiskFactorBreakdown, RiskCalculationOutput } from '../config/riskRules';
import { WeatherContext, WeatherIntent, TimeReference } from '../types/chatContext';
import { AlertContext, AlertSeverity } from '../types/alert';

export interface DecisionResult {
  id: string;
  activity: ActivityConfig;
  customActivityName?: string;
  location: LocationSearchResult;
  dateStr: string; // "Today", "Tomorrow", "2026-09-01"
  timeRange: string; // "Morning (6 AM - 12 PM)", "5:00 PM"
  timePeriodKey: 'morning' | 'afternoon' | 'evening' | 'night' | 'now';
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'SEVERE';
  factors: RiskFactorBreakdown[];
  recommendation: string;
  explanation: string;
  limitations: string[];
  warningOverrideActive: boolean;
  warningDetails?: string;
  alternativeTimeWindow?: {
    timeRange: string;
    riskScore: number;
    riskLevel: string;
    explanation: string;
  };
  calculatedAt: string;
  weatherDataTimestamp: string;
  warningDataTimestamp: string;
  isStaleData?: boolean;
}

export interface TimeComparisonResult {
  activity: ActivityConfig;
  location: LocationSearchResult;
  dateStr: string;
  periodA: {
    label: string;
    riskScore: number;
    riskLevel: string;
    rainProb: number;
    temp: number;
    windSpeed: number;
  };
  periodB: {
    label: string;
    riskScore: number;
    riskLevel: string;
    rainProb: number;
    temp: number;
    windSpeed: number;
  };
  recommendation: string;
}

/**
 * CORE DECISION ANALYSIS ENGINE
 */
export async function analyzeWeatherDecision(
  activityInput: ActivityId | string,
  location?: LocationSearchResult,
  dateStr: string = 'Today',
  timeInput: string = 'Afternoon'
): Promise<DecisionResult> {
  // 1. Resolve Activity Configuration
  let activity: ActivityConfig;
  let customActivityName: string | undefined = undefined;

  if (typeof activityInput === 'string' && ACTIVITIES_CONFIG[activityInput as ActivityId]) {
    activity = ACTIVITIES_CONFIG[activityInput as ActivityId];
  } else if (typeof activityInput === 'string') {
    activity = classifyActivityText(activityInput);
    customActivityName = activityInput;
  } else {
    activity = ACTIVITIES_CONFIG.cricket;
  }

  // 2. Resolve Weather Context & Alert Context for Target Location
  const weatherCtx: WeatherContext = await getWeatherContext(location, 'GENERAL_WEATHER', dateStr);

  const targetLoc: LocationSearchResult = location || {
    id: Date.now(),
    name: weatherCtx.location.name,
    latitude: weatherCtx.location.latitude,
    longitude: weatherCtx.location.longitude,
    country: weatherCtx.location.country || 'India',
    admin1: weatherCtx.location.admin1 || '',
    timezone: 'Asia/Kolkata'
  };

  const alertCtx: AlertContext = await getAlertsForLocation(targetLoc);

  // 3. Extract Target Weather Telemetry for selected date & time period
  const telemetry = extractPeriodTelemetry(weatherCtx, dateStr, timeInput);

  if (telemetry.unavailable) {
    throw new Error('Insufficient weather data to calculate this assessment for the requested date/time.');
  }

  // 4. Calculate Deterministic Activity Risk
  // Only apply a warning if it actually covers the selected date/time period.
  const allNonGreenAlerts = alertCtx.activeAlerts.filter((a) => a.severity !== 'GREEN');
  const applicableWarning = allNonGreenAlerts.find((a) =>
    isWarningApplicableToSelectedPeriod(a, telemetry.dayOffset)
  );

  const riskResult: RiskCalculationOutput = calculateActivityRisk(
    activity,
    telemetry.rainProb,
    telemetry.windSpeed,
    telemetry.temp,
    telemetry.feelsLike,
    telemetry.condition,
    applicableWarning?.severity,
    applicableWarning?.title
  );

  // 5. Requirement 15: Potentially Better Time Window Suggestion
  let alternativeTimeWindow: DecisionResult['alternativeTimeWindow'] = undefined;

  if (riskResult.riskScore > 40) {
    const alternative = findBetterTimeWindow(activity, weatherCtx, dateStr, timeInput, allNonGreenAlerts);
    if (alternative && alternative.riskScore < riskResult.riskScore - 12) {
      alternativeTimeWindow = {
        timeRange: alternative.label,
        riskScore: alternative.riskScore,
        riskLevel: alternative.riskLevel,
        explanation: `Potentially lower weather risk (${alternative.riskScore}/100 vs ${riskResult.riskScore}/100) based on available forecast data.`
      };
    }
  }

  return {
    id: `decision-${Date.now()}`,
    activity,
    customActivityName,
    location: targetLoc,
    dateStr,
    timeRange: telemetry.label,
    timePeriodKey: telemetry.periodKey,
    riskScore: riskResult.riskScore,
    riskLevel: riskResult.riskLevel,
    factors: riskResult.factors,
    recommendation: riskResult.recommendation,
    explanation: riskResult.explanation,
    limitations: [
      'Decision support only — weather conditions can change rapidly.',
      'Always follow official weather warnings and local authority guidance.'
    ],
    warningOverrideActive: riskResult.warningOverrideActive,
    warningDetails: riskResult.warningDetails,
    alternativeTimeWindow,
    calculatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    weatherDataTimestamp: weatherCtx.retrievedAt,
    warningDataTimestamp: alertCtx.retrievedAt,
    isStaleData: weatherCtx.isCached
  };
}

/**
 * Requirement 16: Compare Two Time Periods Side by Side
 */
export async function compareTimePeriods(
  activityInput: ActivityId | string,
  location: LocationSearchResult,
  dateStr: string,
  periodA: string,
  periodB: string
): Promise<TimeComparisonResult> {
  const resultA = await analyzeWeatherDecision(activityInput, location, dateStr, periodA);
  const resultB = await analyzeWeatherDecision(activityInput, location, dateStr, periodB);

  const telemetryA = extractPeriodTelemetry(await getWeatherContext(location, 'GENERAL_WEATHER', dateStr), dateStr, periodA);
  const telemetryB = extractPeriodTelemetry(await getWeatherContext(location, 'GENERAL_WEATHER', dateStr), dateStr, periodB);

  const isALower = resultA.riskScore < resultB.riskScore;
  const winnerPeriod = isALower ? resultA.timeRange : resultB.timeRange;
  const winnerScore = isALower ? resultA.riskScore : resultB.riskScore;

  return {
    activity: resultA.activity,
    location,
    dateStr,
    periodA: {
      label: resultA.timeRange,
      riskScore: resultA.riskScore,
      riskLevel: resultA.riskLevel,
      rainProb: telemetryA.rainProb,
      temp: telemetryA.temp,
      windSpeed: telemetryA.windSpeed
    },
    periodB: {
      label: resultB.timeRange,
      riskScore: resultB.riskScore,
      riskLevel: resultB.riskLevel,
      rainProb: telemetryB.rainProb,
      temp: telemetryB.temp,
      windSpeed: telemetryB.windSpeed
    },
    recommendation: `${winnerPeriod} has a lower calculated weather risk (${winnerScore}/100) based on the available forecast.`
  };
}

/**
 * Resolves the target calendar date for a given dateStr relative to now.
 * Returns a Date set to midnight local time for the selected day.
 */
function resolveTargetDate(dateStr: string): Date {
  const norm = dateStr.toLowerCase().trim();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (norm === 'today') return today;

  if (norm === 'day after tomorrow' || norm.includes('day after')) {
    const d = new Date(today);
    d.setDate(d.getDate() + 2);
    return d;
  }

  if (norm === 'tomorrow' || norm.startsWith('tomorrow')) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d;
  }

  // Try parsing a real date string (e.g. "2026-09-10")
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    parsed.setHours(0, 0, 0, 0);
    return parsed;
  }

  // Default: today
  return today;
}

/**
 * Returns the hour range [startHour, endHour) for a time period label.
 */
function resolveTimePeriodHours(timeInput: string): { startHour: number; endHour: number; periodKey: 'morning' | 'afternoon' | 'evening' | 'night' | 'now'; label: string } {
  const t = timeInput.toLowerCase();
  if (t.includes('morning')) {
    return { startHour: 6, endHour: 12, periodKey: 'morning', label: 'Morning (6 AM – 12 PM)' };
  }
  if (t.includes('afternoon')) {
    return { startHour: 12, endHour: 17, periodKey: 'afternoon', label: 'Afternoon (12 PM – 5 PM)' };
  }
  if (t.includes('evening')) {
    return { startHour: 17, endHour: 22, periodKey: 'evening', label: 'Evening (5 PM – 10 PM)' };
  }
  if (t.includes('night')) {
    return { startHour: 22, endHour: 27, periodKey: 'night', label: 'Night (10 PM – 3 AM)' }; // endHour > 24 handled via next-day
  }
  // Default: full day / 'now'
  return { startHour: 0, endHour: 24, periodKey: 'now', label: timeInput };
}

/**
 * Checks whether a warning (with string validFrom/validUntil like "10:30 PM") overlaps
 * the selected day. Since the demo provider stores validFrom/validUntil relative to NOW,
 * the warning is only considered active for TODAY (dayOffset=0).
 * For future days, warnings are not blindly applied.
 */
function isWarningApplicableToSelectedPeriod(
  warning: { validFrom: string; validUntil: string; status: string },
  dayOffset: number
): boolean {
  // A warning that is ACTIVE is valid relative to current time (today only).
  // For Tomorrow or Day After Tomorrow, the current demo alerts do not extend that far.
  // Only apply if dayOffset === 0 (Today) and status is ACTIVE.
  if (dayOffset > 0) return false;
  return warning.status === 'ACTIVE';
}

/**
 * Helper: Extracts target telemetry for selected date & time using actual ISO timestamps.
 */
function extractPeriodTelemetry(
  context: WeatherContext,
  dateStr: string,
  timeInput: string
) {
  const current = context.current;
  const hourly = context.hourly || [];
  const daily = context.daily || [];

  if (!current) {
    return { unavailable: true, rainProb: 0, temp: 0, feelsLike: 0, windSpeed: 0, condition: '', label: '', periodKey: 'now' as const, dayOffset: 0 };
  }

  // 1. Resolve the target date and day offset (0=Today, 1=Tomorrow, 2=Day After Tomorrow)
  const targetDate = resolveTargetDate(dateStr);
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const dayOffset = Math.round((targetDate.getTime() - todayMidnight.getTime()) / (24 * 60 * 60 * 1000));

  // 2. Resolve time period
  const { startHour, endHour, periodKey, label: periodLabel } = resolveTimePeriodHours(timeInput);
  const fullLabel = `${dateStr} ${periodLabel}`;

  // 3. Select hourly records matching the target date AND hour range using datetimeISO
  let targetHourly = hourly.filter((h) => {
    if (!h.datetimeISO) return false;
    const dt = new Date(h.datetimeISO);
    const dtDate = new Date(dt);
    dtDate.setHours(0, 0, 0, 0);
    const isCorrectDay = dtDate.getTime() === targetDate.getTime();
    const hour = dt.getHours();
    return isCorrectDay && hour >= startHour && hour < (endHour > 24 ? 24 : endHour);
  });

  // 4. Fallback: if no hourly records with datetimeISO (e.g. old cache), fall back to daily data
  if (targetHourly.length === 0) {
    const dailyForDay = daily[dayOffset];
    const rainProb = dayOffset > 0
      ? (dailyForDay?.rainProbability ?? current.precipitation)
      : current.precipitation;
    const temp = dayOffset > 0
      ? (dailyForDay?.high ?? current.temperature)
      : current.temperature;

    return {
      unavailable: false,
      rainProb,
      temp,
      feelsLike: temp + (current.feelsLike - current.temperature),
      windSpeed: current.windSpeed,
      condition: current.weatherCondition,
      label: fullLabel,
      periodKey,
      dayOffset
    };
  }

  // 5. Aggregate the selected hours
  const rainProb = Math.max(...targetHourly.map((h) => h.precipitationProbability));
  const temp = Math.round(targetHourly.reduce((acc, h) => acc + h.temp, 0) / targetHourly.length);
  const windSpeed = Math.max(...targetHourly.map((h) => h.windSpeed));
  const condition = targetHourly[0]?.conditionCode || current.weatherCondition;

  return {
    unavailable: false,
    rainProb,
    temp,
    feelsLike: temp + (current.feelsLike - current.temperature),
    windSpeed,
    condition,
    label: fullLabel,
    periodKey,
    dayOffset
  };
}

/**
 * Helper: Finds alternative time window on same day with lower risk
 */
function findBetterTimeWindow(
  activity: ActivityConfig,
  context: WeatherContext,
  dateStr: string,
  currentTimeInput: string,
  allAlerts: Array<{ severity: AlertSeverity; title: string; validFrom: string; validUntil: string; status: string }>
) {
  const candidatePeriods = ['Morning', 'Afternoon', 'Evening', 'Night'];

  let bestCandidate: { label: string; riskScore: number; riskLevel: string } | null = null;
  let lowestScore = 999;

  for (const period of candidatePeriods) {
    if (period.toLowerCase() === currentTimeInput.toLowerCase()) continue;

    const telem = extractPeriodTelemetry(context, dateStr, period);

    // Check whether any warning applies to this candidate period
    const applicableWarning = allAlerts.find(
      (a) => a.severity !== ('GREEN' as AlertSeverity) && isWarningApplicableToSelectedPeriod(a, telem.dayOffset)
    );

    const risk = calculateActivityRisk(
      activity,
      telem.rainProb,
      telem.windSpeed,
      telem.temp,
      telem.feelsLike,
      telem.condition,
      applicableWarning?.severity,
      applicableWarning?.title
    );

    if (risk.riskScore < lowestScore) {
      lowestScore = risk.riskScore;
      bestCandidate = {
        label: telem.label,
        riskScore: risk.riskScore,
        riskLevel: risk.riskLevel
      };
    }
  }

  return bestCandidate;
}

