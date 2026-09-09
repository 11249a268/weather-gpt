/**
 * LLM PROVIDER ABSTRACTION LAYER
 * Requirement 15 & 16: Prepared for future LLM integration (Gemini / OpenAI).
 *
 * SAFETY RULE:
 * The LLM abstraction ONLY receives verified structured facts from weatherService, alertService,
 * and decisionService. It does NOT generate or invent raw telemetry or risk scores.
 */

export interface StructuredExplanationInput {
  intent: string;
  activityName?: string;
  locationName: string;
  dateStr: string;
  timeRange: string;
  riskScore?: number;
  riskLevel?: string;
  rainProb: number;
  temp: number;
  windSpeed: number;
  conditionText: string;
  warningSeverity?: string;
  warningTitle?: string;
  recommendation?: string;
  factorsSummary?: string[];
  alternativeSuggestion?: string;
}

export async function generateExplanation(
  input: StructuredExplanationInput
): Promise<string> {
  // Deterministic, grounded template explanation engine (Default non-hallucinating mode)
  return formatGroundedExplanation(input);
}

/**
 * Deterministic evidence-grounded template formatter
 */
function formatGroundedExplanation(input: StructuredExplanationInput): string {
  const {
    intent,
    activityName,
    locationName,
    dateStr,
    timeRange,
    riskScore,
    riskLevel,
    rainProb,
    temp,
    windSpeed,
    conditionText,
    warningSeverity,
    warningTitle,
    recommendation,
    alternativeSuggestion
  } = input;

  if (intent === 'DECISION_QUERY' || intent === 'OUTDOOR_ACTIVITY' || intent === 'TRAVEL_DECISION' || intent === 'EVENT_PLANNING' || riskScore !== undefined) {
    let text = `For **${activityName || 'your planned activity'}** in **${locationName}** (${dateStr}, ${timeRange}), the calculated weather risk is **${riskScore}/100 (${riskLevel})**.\n\n`;

    if (input.factorsSummary && input.factorsSummary.length > 0) {
      text += `**WHY THIS RISK SCORE?**\n`;
      input.factorsSummary.forEach((factor) => {
        text += `- ${factor}\n`;
      });
      text += `\n`;
    }

    if (warningSeverity && warningSeverity !== 'GREEN') {
      text += `⚠️ **Official Warning Active:** ${warningSeverity} Alert (${warningTitle || 'District warning'}) is in effect for ${locationName}.\n\n`;
    }

    if (recommendation) {
      text += `💡 **Recommendation:** ${recommendation}\n`;
    }

    if (alternativeSuggestion) {
      text += `\n🕒 **Potentially Better Time Window:** ${alternativeSuggestion}`;
    }

    return text;
  }

  if (intent === 'RAIN_FORECAST') {
    return `Based on live forecast telemetry for **${locationName}** (${dateStr}, ${timeRange}), the precipitation probability is **${rainProb}%** with expected conditions of *${conditionText}*. ${
      rainProb >= 40 ? 'Carrying rain protection would be advisable.' : 'Significant rainfall is not currently projected.'
    }`;
  }

  if (intent === 'TEMPERATURE') {
    return `The projected temperature in **${locationName}** for **${dateStr}** (${timeRange}) is **${temp}°C** with expected conditions of *${conditionText}*.`;
  }

  if (intent === 'WEATHER_ALERT') {
    if (warningSeverity && warningSeverity !== 'GREEN') {
      return `⚠️ Official **${warningSeverity} Alert** is currently active for **${locationName}** (${warningTitle || 'District severe notice'}). Valid until official expiration.`;
    }
    return `✓ No active severe weather warnings have been detected for **${locationName}** at this time (GREEN status).`;
  }

  // Default general weather explanation
  return `Weather forecast for **${locationName}** (${dateStr}, ${timeRange}): Currently **${temp}°C**, conditions *${conditionText}*, with **${rainProb}%** rain chance and wind speeds of **${windSpeed} km/h**.`;
}
