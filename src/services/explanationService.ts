import { generateExplanation, StructuredExplanationInput } from './llmService';
import { DecisionResult } from './decisionService';
import { WeatherContext } from '../types/chatContext';
import { AlertContext } from '../types/alert';
import { ParsedQuery } from './queryUnderstandingService';

export interface ClimateGPTResult {
  locationName: string;
  secondaryLocationName?: string;
  periodLabel: string;
  metricLabel: string;
  currentValue: string;
  baselineValue: string;
  differenceValue: string;
  insightSummary: string;
  dataSource: string;
}

export interface WeatherGPTResponse {
  id: string;
  query: string;
  intent: string;
  title: string;
  explanationText: string;
  structuredDecision?: DecisionResult;
  climateResult?: ClimateGPTResult;
  weatherContext?: WeatherContext;
  alertContext?: AlertContext;
  recommendation?: string;
  sources: {
    weatherProvider: string;
    weatherTimestamp: string;
    alertProvider: string;
    alertTimestamp: string;
  };
  followUpSuggestions: string[];
  debugInfo: {
    parsedQuery: ParsedQuery;
    activityId?: string;
    dateStr?: string;
    timeInput?: string;
    locationName: string;
    riskScore?: number;
    explanationSource: string;
  };
}

/**
 * EXPLANATION SERVICE
 * Requirement 14 & 18 & Step 9: Formulates evidence-grounded, non-hallucinating explanations.
 */
export async function buildWeatherGPTResponse(
  query: ParsedQuery,
  weatherCtx: WeatherContext,
  alertCtx?: AlertContext,
  decisionResult?: DecisionResult
): Promise<WeatherGPTResponse> {
  const activeAlert = alertCtx?.activeAlerts.find((a) => a.severity !== 'GREEN');

  const currentMetric = weatherCtx.current;
  const rainProb = decisionResult ? (decisionResult.factors.find(f => f.id === 'factor-rain')?.rawMetric ? parseInt(decisionResult.factors.find(f => f.id === 'factor-rain')!.rawMetric) : currentMetric.precipitation) : currentMetric.precipitation;

  const inputForLLM: StructuredExplanationInput = {
    intent: query.intent,
    activityName: decisionResult?.activity.name,
    locationName: weatherCtx.location.name,
    dateStr: decisionResult?.dateStr || query.dateReference,
    timeRange: decisionResult?.timeRange || query.timeReference,
    riskScore: decisionResult?.riskScore,
    riskLevel: decisionResult?.riskLevel,
    rainProb,
    temp: currentMetric.temperature,
    windSpeed: currentMetric.windSpeed,
    conditionText: currentMetric.weatherCondition,
    warningSeverity: activeAlert?.severity,
    warningTitle: activeAlert?.title,
    recommendation: decisionResult?.recommendation,
    factorsSummary: decisionResult?.factors.map((f) => f.explanation),
    alternativeSuggestion: decisionResult?.alternativeTimeWindow?.timeRange
  };

  const naturalExplanation = await generateExplanation(inputForLLM);

  const title = decisionResult
    ? `${decisionResult.activity.icon} ${decisionResult.activity.name} Weather Assessment`
    : `Weather Assessment for ${weatherCtx.location.name}`;

  return {
    id: `resp-${Date.now()}`,
    query: query.originalQuery,
    intent: query.intent,
    title,
    explanationText: naturalExplanation,
    structuredDecision: decisionResult,
    weatherContext: weatherCtx,
    alertContext: alertCtx,
    recommendation: decisionResult?.recommendation,
    sources: {
      weatherProvider: weatherCtx.provider || 'Open-Meteo API',
      weatherTimestamp: weatherCtx.retrievedAt,
      alertProvider: alertCtx?.provider || 'IMD Alert Service',
      alertTimestamp: alertCtx?.retrievedAt || 'Live'
    },
    followUpSuggestions: generateFollowUpSuggestions(query, decisionResult),
    debugInfo: {
      parsedQuery: query,
      activityId: decisionResult?.activity.id,
      dateStr: decisionResult?.dateStr,
      timeInput: decisionResult?.timeRange,
      locationName: weatherCtx.location.name,
      riskScore: decisionResult?.riskScore,
      explanationSource: 'Grounded LLM Abstraction Engine'
    }
  };
}

function generateFollowUpSuggestions(query: ParsedQuery, decision?: DecisionResult): string[] {
  if (decision) {
    return [
      `What about ${decision.timePeriodKey === 'evening' ? 'morning' : 'evening'}?`,
      'How was this risk score calculated?',
      'Show me a better time window'
    ];
  }

  if (query.intent === 'WEATHER_ALERT') {
    return [
      'Why am I getting this alert?',
      'Should I travel during this alert?',
      'What time will the warning end?'
    ];
  }

  if (query.intent === 'CLIMATE_QUESTION') {
    return [
      'What about rainfall?',
      'Compare Chennai and Bengaluru weather history',
      'Show 1-year climate trends'
    ];
  }

  return [
    'Can I play cricket tomorrow evening?',
    'Will it rain tomorrow?',
    'Are there any warnings in my area?'
  ];
}

