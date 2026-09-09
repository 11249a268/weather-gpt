import { detectLanguage, normalizeMultilingualQuery } from './languageService';
import { translateExplanationText } from './translationService';
import { parseUserQuery, ParsedQuery } from './queryUnderstandingService';
import { getConversationState, updateConversationLocation, mergeQueryContext, addChatMessage } from './conversationContextService';
import { getWeatherContext, searchLocations } from './weatherService';
import { getAlertsForLocation } from './alertService';
import { analyzeWeatherDecision, DecisionResult } from './decisionService';
import { buildWeatherGPTResponse, WeatherGPTResponse, ClimateGPTResult } from './explanationService';
import { fetchHistoricalClimateData, getHistoricalComparison, fetchMultiYearComparison } from './historicalWeatherService';
import { LocationSearchResult } from './weatherProviders/openMeteoProvider';
import { WeatherContext } from '../types/chatContext';
import { AlertContext } from '../types/alert';
import { SupportedLanguageCode } from '../config/languageConfig';

/**
 * CENTRAL MULTILINGUAL WEATHER QUERY PIPELINE (Requirement 1, 5 & 40)
 * User Query (Any Language) -> Language Detection -> Multilingual Normalization -> Query Understanding -> Telemetry & Decision Engine -> Response Translation
 */
export async function processWeatherQuery(
  userQueryText: string,
  currentLocation?: LocationSearchResult,
  userSelectedLang: SupportedLanguageCode = 'en'
): Promise<WeatherGPTResponse> {
  // 1. Detect & Normalize Multilingual / Mixed-Language Queries
  const detectedLang = detectLanguage(userQueryText, userSelectedLang);
  const targetLang = userSelectedLang !== 'en' ? userSelectedLang : detectedLang;
  const normalizedQueryText = normalizeMultilingualQuery(userQueryText, targetLang);

  // 2. Natural Language Query Understanding
  const parsed: ParsedQuery = parseUserQuery(normalizedQueryText);

  // 3. Handle Unknown Questions
  if (parsed.intent === 'UNKNOWN' && !parsed.activity) {
    const defaultLoc = currentLocation || getConversationState().activeLocation;
    const weatherCtx = await getWeatherContext(defaultLoc, 'GENERAL_WEATHER', 'Today');
    const rawUnknownText = "I can help you with current weather, hourly forecasts, weather warnings, travel decisions, outdoor sports, climate intelligence, and historical weather trends. Could you rephrase your question?";
    const translatedUnknown = await translateExplanationText(rawUnknownText, targetLang);

    return {
      id: `resp-${Date.now()}`,
      query: userQueryText,
      intent: 'UNKNOWN',
      title: 'WeatherGPT Query Understanding',
      explanationText: translatedUnknown,
      weatherContext: weatherCtx,
      sources: {
        weatherProvider: weatherCtx.provider,
        weatherTimestamp: weatherCtx.retrievedAt,
        alertProvider: 'N/A',
        alertTimestamp: 'N/A'
      },
      followUpSuggestions: [
        'Was this month hotter than usual?',
        'Can I play cricket tomorrow evening?',
        'Compare Chennai and Bengaluru historically'
      ],
      debugInfo: {
        parsedQuery: parsed,
        locationName: defaultLoc.name,
        explanationSource: `Grounded LLM Engine (${targetLang.toUpperCase()})`
      }
    };
  }

  // 4. Resolve Target Location & Secondary Location
  let targetLocation = currentLocation || getConversationState().activeLocation;
  let secondaryLocation: LocationSearchResult | undefined = undefined;

  if (parsed.locationReference && parsed.locationReference !== 'current_location') {
    try {
      const searchRes = await searchLocations(parsed.locationReference);
      if (searchRes.length > 0) {
        targetLocation = searchRes[0];
        updateConversationLocation(targetLocation);
      }
    } catch (e) {
      console.error('Failed to resolve custom location', e);
    }
  }

  if (parsed.secondaryLocationReference) {
    try {
      const searchResB = await searchLocations(parsed.secondaryLocationReference);
      if (searchResB.length > 0) {
        secondaryLocation = searchResB[0];
      }
    } catch (e) {
      console.error('Failed to resolve secondary location', e);
    }
  }

  // 5. Merge Conversation Memory & Context (Requirements 30 & 31)
  const mergedContext = mergeQueryContext(parsed);

  // 6. Handle Clarification Requests
  if (parsed.requiresClarification && parsed.clarificationPrompt) {
    const weatherCtx = await getWeatherContext(targetLocation, 'GENERAL_WEATHER', 'Today');
    const translatedClarification = await translateExplanationText(parsed.clarificationPrompt, targetLang);

    return {
      id: `resp-${Date.now()}`,
      query: userQueryText,
      intent: parsed.intent,
      title: 'Clarification Needed',
      explanationText: translatedClarification,
      weatherContext: weatherCtx,
      sources: {
        weatherProvider: weatherCtx.provider,
        weatherTimestamp: weatherCtx.retrievedAt,
        alertProvider: 'N/A',
        alertTimestamp: 'N/A'
      },
      followUpSuggestions: [
        'Tomorrow evening',
        'Today at 5 PM',
        'Tomorrow morning'
      ],
      debugInfo: {
        parsedQuery: parsed,
        locationName: targetLocation.name,
        explanationSource: `Grounded LLM Engine (${targetLang.toUpperCase()})`
      }
    };
  }

  // 7. Handle Climate & Historical Intelligence Questions (Requirement 19, 21, 22, 23, 24, 27, 28)
  if (parsed.intent === 'CLIMATE_QUESTION') {
    const weatherCtx = await getWeatherContext(targetLocation, 'GENERAL_WEATHER', 'Today');

    // Dual Location Comparison ("Compare Chennai and Bengaluru weather history")
    if (secondaryLocation || (parsed.secondaryLocationReference && secondaryLocation)) {
      const compRes = await getHistoricalComparison(targetLocation, secondaryLocation!, '30days');
      
      const climateResult: ClimateGPTResult = {
        locationName: targetLocation.name,
        secondaryLocationName: secondaryLocation!.name,
        periodLabel: compRes.periodLabel,
        metricLabel: 'Historical Comparison',
        currentValue: `${compRes.dataA.currentAvgTemp ?? 'N/A'}°C (${targetLocation.name})`,
        baselineValue: `${compRes.dataB.currentAvgTemp ?? 'N/A'}°C (${secondaryLocation!.name})`,
        differenceValue: compRes.dataA.currentAvgTemp && compRes.dataB.currentAvgTemp
          ? `${(compRes.dataA.currentAvgTemp - compRes.dataB.currentAvgTemp).toFixed(1)}°C`
          : 'N/A',
        insightSummary: compRes.summary,
        dataSource: compRes.dataSource
      };

      const rawExplanation = `Based on historical climate data, in **${targetLocation.name}** the 30-day average temperature was **${compRes.dataA.currentAvgTemp ?? 'N/A'}°C** with **${compRes.dataA.currentTotalRain ?? 'N/A'} mm** rainfall. In **${secondaryLocation!.name}**, the 30-day average temperature was **${compRes.dataB.currentAvgTemp ?? 'N/A'}°C** with **${compRes.dataB.currentTotalRain ?? 'N/A'} mm** rainfall.\n\n${compRes.summary}\n\n*Note: Historical comparisons describe observed weather patterns in the available data. They do not by themselves establish the cause of long-term climate change.*`;

      const translatedExplanation = await translateExplanationText(rawExplanation, targetLang);

      return {
        id: `resp-${Date.now()}`,
        query: userQueryText,
        intent: 'CLIMATE_QUESTION',
        title: `Historical Climate Comparison: ${targetLocation.name} vs ${secondaryLocation!.name}`,
        explanationText: translatedExplanation,
        climateResult,
        weatherContext: weatherCtx,
        sources: {
          weatherProvider: compRes.dataSource,
          weatherTimestamp: compRes.retrievedAt,
          alertProvider: 'N/A',
          alertTimestamp: 'N/A'
        },
        followUpSuggestions: [
          'What about rainfall?',
          'Was this month hotter than usual?',
          'Show temperature trends'
        ],
        debugInfo: {
          parsedQuery: parsed,
          locationName: `${targetLocation.name} vs ${secondaryLocation!.name}`,
          explanationSource: `Grounded LLM Engine (${targetLang.toUpperCase()})`
        }
      };
    }

    // Single Location Historical Query
    const range = mergedContext.climateDateRange === '7_DAYS' ? '7days' :
                  mergedContext.climateDateRange === '3_MONTHS' ? '3months' :
                  mergedContext.climateDateRange === 'PAST_YEAR' || mergedContext.climateDateRange === '1_YEAR' ? '1year' :
                  mergedContext.climateDateRange === 'MULTIPLE_YEARS' ? '3years' : '30days';

    const historicalData = await fetchHistoricalClimateData(targetLocation, range);

    let metricLabel = 'Temperature';
    let currentValue = `${historicalData.currentAvgTemp ?? 'N/A'}°C`;
    let baselineValue = `${historicalData.baselineAvgTemp ?? 'N/A'}°C`;
    let differenceValue = historicalData.tempDiff !== null ? `${historicalData.tempDiff >= 0 ? '+' : ''}${historicalData.tempDiff}°C` : 'N/A';
    let insightText = historicalData.tempDiffLabel;

    if (mergedContext.climateMetric === 'RAINFALL') {
      metricLabel = 'Accumulated Rainfall';
      currentValue = `${historicalData.currentTotalRain ?? 'N/A'} mm`;
      baselineValue = `${historicalData.baselineTotalRain ?? 'N/A'} mm`;
      differenceValue = historicalData.rainDiff !== null ? `${historicalData.rainDiff >= 0 ? '+' : ''}${historicalData.rainDiff} mm` : 'N/A';
      insightText = historicalData.rainDiffLabel;
    } else if (mergedContext.climateMetric === 'HUMIDITY') {
      metricLabel = 'Average Relative Humidity';
      currentValue = `${historicalData.currentAvgHumidity ?? 'N/A'}%`;
      baselineValue = `${historicalData.baselineAvgHumidity ?? 'N/A'}%`;
      differenceValue = historicalData.humidityDiff !== null ? `${historicalData.humidityDiff >= 0 ? '+' : ''}${historicalData.humidityDiff}%` : 'N/A';
      insightText = historicalData.humidityDiff !== null
        ? (historicalData.humidityDiff >= 0 ? `+${historicalData.humidityDiff}% above baseline` : `${historicalData.humidityDiff}% below baseline`)
        : 'Humidity baseline unavailable';
    }

    const climateResult: ClimateGPTResult = {
      locationName: targetLocation.name,
      periodLabel: historicalData.periodLabel,
      metricLabel,
      currentValue,
      baselineValue,
      differenceValue,
      insightSummary: insightText,
      dataSource: historicalData.dataSource
    };

    let rawExplanation = '';
    if (!historicalData.isAvailable) {
      rawExplanation = `Historical weather data is not available from the current data provider for **${targetLocation.name}** during this period. Current weather and forecast features remain fully functional.`;
    } else if (mergedContext.climateMetric === 'RAINFALL') {
      rawExplanation = `Based on historical climate records for **${targetLocation.name}**, accumulated rainfall over the selected period (${historicalData.periodLabel}) was **${currentValue}**. The historical baseline average for this period is **${baselineValue}** (Difference: **${differenceValue}**).\n\n${insightText}.\n\n*Note: Historical comparisons describe observed weather patterns in the available data. They do not by themselves establish the cause of long-term climate change.*`;
    } else {
      rawExplanation = `Based on historical climate records for **${targetLocation.name}**, the average temperature over the selected period (${historicalData.periodLabel}) was **${currentValue}**. The historical 3-year baseline average for this period is **${baselineValue}** (Difference: **${differenceValue}**).\n\n${insightText}.\n\n*Educational Distinction: Weather describes short-term daily conditions (e.g. tomorrow's rain), whereas Climate describes long-term historical averages.*\n\n*Disclaimer: Historical comparisons describe observed weather patterns in the available data. They do not by themselves establish the cause of long-term climate change.*`;
    }

    const translatedExplanation = await translateExplanationText(rawExplanation, targetLang);

    return {
      id: `resp-${Date.now()}`,
      query: userQueryText,
      intent: 'CLIMATE_QUESTION',
      title: `Climate Intelligence Analysis for ${targetLocation.name}`,
      explanationText: translatedExplanation,
      climateResult,
      weatherContext: weatherCtx,
      sources: {
        weatherProvider: historicalData.dataSource,
        weatherTimestamp: historicalData.retrievedAt,
        alertProvider: 'N/A',
        alertTimestamp: 'N/A'
      },
      followUpSuggestions: [
        'What about rainfall?',
        'Compare Chennai and Bengaluru historically',
        'Show 1-year climate trends'
      ],
      debugInfo: {
        parsedQuery: parsed,
        locationName: targetLocation.name,
        explanationSource: `Grounded LLM Engine (${targetLang.toUpperCase()})`
      }
    };
  }

  // 8. Fetch Telemetry & Execute Downstream Services
  let weatherCtx: WeatherContext = await getWeatherContext(targetLocation, parsed.intent as any, mergedContext.dateStr);
  let alertCtx: AlertContext | undefined = undefined;
  let decisionResult: DecisionResult | undefined = undefined;

  if (parsed.requiresAlerts) {
    alertCtx = await getAlertsForLocation(targetLocation);
  }

  const shouldRunDecision = parsed.requiresDecision || parsed.extractedEntities.hasExplicitActivity || (mergedContext.isFollowUp && !!mergedContext.activity);

  if (shouldRunDecision) {
    if (!alertCtx) {
      alertCtx = await getAlertsForLocation(targetLocation);
    }
    decisionResult = await analyzeWeatherDecision(
      mergedContext.activity,
      targetLocation,
      mergedContext.dateStr,
      mergedContext.timeInput
    );
  }

  // 9. Generate Base Factual WeatherGPT Response
  const baseResponse = await buildWeatherGPTResponse(
    parsed,
    weatherCtx,
    alertCtx,
    decisionResult
  );

  // 10. Requirement 16, 17 & 18: Response Translation into Target Language
  const translatedExplanation = await translateExplanationText(baseResponse.explanationText, targetLang);

  return {
    ...baseResponse,
    explanationText: translatedExplanation,
    debugInfo: {
      ...baseResponse.debugInfo,
      explanationSource: `Grounded LLM Engine (${targetLang.toUpperCase()})`
    }
  };
}

