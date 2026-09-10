/**
 * LLM PROVIDER ABSTRACTION LAYER
 * Requirement 15 & 16: Prepared for future LLM integration (Gemini / OpenAI).
 *
 * SAFETY RULE:
 * The LLM abstraction ONLY receives verified structured facts from weatherService,
 * alertService, and decisionService.
 *
 * IMPORTANT:
 * Risk wording is ONLY produced when a real DecisionResult has supplied
 * a valid risk score and risk level.
 *
 * Generic travel, outdoor, event, agriculture, and weather questions
 * must never display undefined risk values.
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
  return formatGroundedExplanation(input);
}

/**
 * Deterministic evidence-grounded template formatter.
 *
 * IMPORTANT:
 * Never generate a risk-score sentence unless the score is
 * actually present and valid.
 */
function formatGroundedExplanation(
  input: StructuredExplanationInput
): string {
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

  /*
   * ============================================================
   * 1. REAL ACTIVITY RISK RESULT
   * ============================================================
   *
   * This is the ONLY place where riskScore/riskLevel may appear.
   *
   * Examples:
   *   "Can I play cricket?"
   *   "Can I run outside?"
   *   "Can I drive to Chennai?"
   *
   * If there is no real score, this block is skipped completely.
   */
  const hasValidRiskResult =
    typeof riskScore === 'number' &&
    Number.isFinite(riskScore) &&
    typeof riskLevel === 'string' &&
    riskLevel.trim().length > 0 &&
    typeof activityName === 'string' &&
    activityName.trim().length > 0;

  if (hasValidRiskResult) {
    let text =
      `For **${activityName}** in **${locationName}** ` +
      `(${dateStr}, ${timeRange}), the calculated weather risk is ` +
      `**${riskScore}/100 (${riskLevel})**.\n\n`;

    if (
      input.factorsSummary &&
      input.factorsSummary.length > 0
    ) {
      text += `**WHY THIS RISK SCORE?**\n`;

      input.factorsSummary.forEach((factor) => {
        text += `- ${factor}\n`;
      });

      text += `\n`;
    }

    if (
      warningSeverity &&
      warningSeverity !== 'GREEN'
    ) {
      text +=
        `⚠️ **Official Warning Active:** ` +
        `${warningSeverity} Alert ` +
        `(${warningTitle || 'District warning'}) ` +
        `is in effect for ${locationName}.\n\n`;
    }

    if (recommendation) {
      text += `💡 **Recommendation:** ${recommendation}\n`;
    }

    if (alternativeSuggestion) {
      text +=
        `\n🕒 **Potentially Better Time Window:** ` +
        `${alternativeSuggestion}`;
    }

    return text;
  }

  /*
   * ============================================================
   * 2. TRAVEL QUESTION WITHOUT A SPECIFIC ACTIVITY
   * ============================================================
   *
   * Examples:
   *   "Can I go outside now?"
   *   "Can I go to Melbourne now?"
   *   "Can I come to Chennai?"
   *   "Should I travel today?"
   *
   * These are answered using weather conditions.
   * They are NOT forced into the Risk Analyzer.
   */
  if (intent === 'TRAVEL_DECISION') {
    let text =
      `For travel in **${locationName}** ` +
      `(${dateStr}, ${timeRange}), the available weather data shows ` +
      `**${temp}°C**, ${conditionText}, with a **${rainProb}%** ` +
      `chance of rain and wind speeds of **${windSpeed} km/h**.`;

    if (
      warningSeverity &&
      warningSeverity !== 'GREEN'
    ) {
      text +=
        `\n\n⚠️ **Weather Warning:** ` +
        `${warningSeverity} Alert ` +
        `(${warningTitle || 'District warning'}) ` +
        `is active for ${locationName}.`;
    }

    if (rainProb >= 70) {
      text +=
        `\n\n💡 Rain is quite likely, so carry rain protection ` +
        `and allow extra travel time.`;
    } else if (rainProb >= 40) {
      text +=
        `\n\n💡 There is a moderate chance of rain, so it would ` +
        `be sensible to carry rain protection.`;
    } else if (windSpeed >= 35) {
      text +=
        `\n\n💡 Winds are relatively strong, so take extra care ` +
        `while travelling, especially on exposed roads.`;
    } else {
      text +=
        `\n\n💡 The available weather data does not show a ` +
        `significant rain or strong-wind concern for this period.`;
    }

    return text;
  }

  /*
   * ============================================================
   * 3. OUTDOOR QUESTION WITHOUT A VALID RISK RESULT
   * ============================================================
   *
   * Safety fallback:
   * Never display undefined risk.
   */
  if (intent === 'OUTDOOR_ACTIVITY') {
    let text =
      `For outdoor activities in **${locationName}** ` +
      `(${dateStr}, ${timeRange}), the weather is **${temp}°C** ` +
      `with conditions of *${conditionText}*, a **${rainProb}%** ` +
      `chance of rain, and wind speeds of **${windSpeed} km/h**.`;

    if (
      warningSeverity &&
      warningSeverity !== 'GREEN'
    ) {
      text +=
        `\n\n⚠️ **Weather Warning:** ` +
        `${warningSeverity} Alert ` +
        `(${warningTitle || 'District warning'}) ` +
        `is active for ${locationName}.`;
    }

    if (rainProb >= 60) {
      text +=
        `\n\n💡 Outdoor conditions may be affected by the ` +
        `higher chance of rain.`;
    } else if (windSpeed >= 35) {
      text +=
        `\n\n💡 Strong winds may affect outdoor activities.`;
    } else {
      text +=
        `\n\n💡 The available weather data does not show a ` +
        `major weather obstacle for being outdoors.`;
    }

    return text;
  }

  /*
   * ============================================================
   * 4. EVENT PLANNING
   * ============================================================
   */
  if (intent === 'EVENT_PLANNING') {
    let text =
      `For your event in **${locationName}** ` +
      `(${dateStr}, ${timeRange}), the available weather data shows ` +
      `**${temp}°C**, ${conditionText}, with a **${rainProb}%** ` +
      `chance of rain and wind speeds of **${windSpeed} km/h**.`;

    if (
      warningSeverity &&
      warningSeverity !== 'GREEN'
    ) {
      text +=
        `\n\n⚠️ **Weather Warning:** ` +
        `${warningSeverity} Alert ` +
        `(${warningTitle || 'District warning'}) ` +
        `is active for ${locationName}.`;
    }

    if (rainProb >= 60) {
      text +=
        `\n\n💡 A backup indoor or covered arrangement would be ` +
        `sensible because rain is fairly likely.`;
    } else if (windSpeed >= 35) {
      text +=
        `\n\n💡 Consider securing temporary structures because ` +
        `winds are relatively strong.`;
    } else {
      text +=
        `\n\n💡 The available weather data currently shows ` +
        `generally manageable conditions for the event period.`;
    }

    return text;
  }

  /*
   * ============================================================
   * 5. AGRICULTURE / FARMING
   * ============================================================
   */
  if (intent === 'AGRICULTURE_WEATHER') {
    let text =
      `For agricultural planning in **${locationName}** ` +
      `(${dateStr}, ${timeRange}), the available weather data shows ` +
      `**${temp}°C**, ${conditionText}, with a **${rainProb}%** ` +
      `chance of rain and wind speeds of **${windSpeed} km/h**.`;

    if (rainProb >= 60) {
      text +=
        `\n\n💡 Rain is fairly likely, so consider the expected ` +
        `rainfall before irrigation or field work.`;
    } else if (rainProb < 30) {
      text +=
        `\n\n💡 Rain is less likely during this period, so ` +
        `irrigation needs should be considered based on crop and ` +
        `soil conditions.`;
    } else {
      text +=
        `\n\n💡 Weather conditions are mixed, so use the forecast ` +
        `along with crop and soil conditions when planning field work.`;
    }

    return text;
  }

  /*
   * ============================================================
   * 6. RAIN FORECAST
   * ============================================================
   */
  if (intent === 'RAIN_FORECAST') {
    return (
      `Based on live forecast telemetry for **${locationName}** ` +
      `(${dateStr}, ${timeRange}), the precipitation probability ` +
      `is **${rainProb}%** with expected conditions of ` +
      `*${conditionText}*. ` +
      (
        rainProb >= 40
          ? `Carrying rain protection would be advisable.`
          : `Significant rainfall is not currently projected.`
      )
    );
  }

  /*
   * ============================================================
   * 7. TEMPERATURE
   * ============================================================
   */
  if (intent === 'TEMPERATURE') {
    return (
      `The projected temperature in **${locationName}** for ` +
      `**${dateStr}** (${timeRange}) is **${temp}°C** with ` +
      `expected conditions of *${conditionText}*.`
    );
  }

  /*
   * ============================================================
   * 8. WIND
   * ============================================================
   */
  if (intent === 'WIND') {
    let text =
      `The wind speed in **${locationName}** for ` +
      `**${dateStr}** (${timeRange}) is around ` +
      `**${windSpeed} km/h**.`;

    if (windSpeed >= 50) {
      text +=
        ` This is very strong wind and extra caution is advisable.`;
    } else if (windSpeed >= 35) {
      text +=
        ` Winds are relatively strong, so outdoor activities ` +
        `may be affected.`;
    } else if (windSpeed >= 20) {
      text +=
        ` This is a noticeable breeze.`;
    } else {
      text +=
        ` Winds are relatively light.`;
    }

    return text;
  }

  /*
   * ============================================================
   * 9. WEATHER ALERT
   * ============================================================
   */
  if (intent === 'WEATHER_ALERT') {
    if (
      warningSeverity &&
      warningSeverity !== 'GREEN'
    ) {
      return (
        `⚠️ Official **${warningSeverity} Alert** is currently ` +
        `active for **${locationName}** ` +
        `(${warningTitle || 'District severe notice'}). ` +
        `Follow official local guidance.`
      );
    }

    return (
      `✓ No active severe weather warnings have been detected ` +
      `for **${locationName}** at this time (GREEN status).`
    );
  }

  /*
   * ============================================================
   * 10. CURRENT / GENERAL / FORECAST WEATHER
   * ============================================================
   */
  if (
    intent === 'CURRENT_WEATHER' ||
    intent === 'WEATHER_FORECAST' ||
    intent === 'GENERAL_WEATHER' ||
    intent === 'UNKNOWN'
  ) {
    return (
      `Weather for **${locationName}** ` +
      `(${dateStr}, ${timeRange}): **${temp}°C**, ` +
      `conditions *${conditionText}*, ` +
      `with a **${rainProb}%** chance of rain and ` +
      `wind speeds of **${windSpeed} km/h**.`
    );
  }

  /*
   * ============================================================
   * 11. SAFE FINAL FALLBACK
   * ============================================================
   *
   * This ensures that no unsupported intent can ever produce
   * undefined/100.
   */
  return (
    `Weather for **${locationName}** ` +
    `(${dateStr}, ${timeRange}): **${temp}°C**, ` +
    `conditions *${conditionText}*, ` +
    `with a **${rainProb}%** chance of rain and ` +
    `wind speeds of **${windSpeed} km/h**.`
  );
}
