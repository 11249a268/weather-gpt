import { AlertSeverity } from '../types/alert';
import { ActivityConfig } from './activityConfig';

export interface RiskFactorBreakdown {
  id: string;
  name: string;
  icon: string;
  rawMetric: string;
  pointsAdded: number;
  explanation: string;
  isWarningOverride?: boolean;
}

export interface RiskCalculationOutput {
  riskScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'SEVERE';
  factors: RiskFactorBreakdown[];
  warningOverrideActive: boolean;
  warningDetails?: string;
  recommendation: string;
  explanation: string;
}

/**
 * Deterministic Risk Calculation Function
 */
export function calculateActivityRisk(
  activity: ActivityConfig,
  rainProb: number,
  windSpeed: number,
  temp: number,
  feelsLike: number,
  conditionText: string,
  alertSeverity?: AlertSeverity,
  alertTitle?: string
): RiskCalculationOutput {
  const factors: RiskFactorBreakdown[] = [];
  let baseScore = 5; // Baseline minimum risk

  const condLower = conditionText.toLowerCase();
  const isThunderstorm = condLower.includes('thunder') || condLower.includes('lightning') || condLower.includes('squall');
  const isHeavyRain = condLower.includes('heavy rain') || condLower.includes('downpour') || condLower.includes('torrential');

  // 1. Rain Factor Assessment
  if (activity.relevantFactors.includes('rain')) {
    let rainPoints = 0;
    if (rainProb >= 80) rainPoints = 35;
    else if (rainProb >= 60) rainPoints = 25;
    else if (rainProb >= 40) rainPoints = 15;
    else if (rainProb >= 20) rainPoints = 8;

    if (isHeavyRain) rainPoints += 10;

    const weightedRain = Math.round(rainPoints * activity.rainWeight);
    if (weightedRain > 0) {
      baseScore += weightedRain;
      factors.push({
        id: 'factor-rain',
        name: 'Precipitation Chance',
        icon: '🌧️',
        rawMetric: `${rainProb}% Rain Chance`,
        pointsAdded: weightedRain,
        explanation: `🌧 Heavy rain / precipitation risk (${rainProb}%) -> +${weightedRain}`
      });
    }
  }

  // 2. Thunderstorm & Severe Condition Assessment
  if (activity.relevantFactors.includes('thunderstorm') && isThunderstorm) {
    const thunderPoints = Math.round(30 * activity.thunderWeight);
    baseScore += thunderPoints;
    factors.push({
      id: 'factor-thunder',
      name: 'Thunderstorm / Lightning Risk',
      icon: '⚡',
      rawMetric: conditionText,
      pointsAdded: thunderPoints,
      explanation: `⚡ Lightning / Thunderstorm warning (${conditionText}) -> +${thunderPoints}`
    });
  }

  // 3. Wind Speed Assessment
  if (activity.relevantFactors.includes('wind')) {
    let windPoints = 0;
    if (windSpeed >= 40) windPoints = 30;
    else if (windSpeed >= 30) windPoints = 20;
    else if (windSpeed >= 20) windPoints = 10;
    else if (windSpeed >= 12) windPoints = 5;

    const weightedWind = Math.round(windPoints * activity.windWeight);
    if (weightedWind > 0) {
      baseScore += weightedWind;
      factors.push({
        id: 'factor-wind',
        name: 'Wind Speed',
        icon: '💨',
        rawMetric: `${windSpeed} km/h Wind`,
        pointsAdded: weightedWind,
        explanation: `💨 Strong wind (${windSpeed} km/h) -> +${weightedWind}`
      });
    }
  }

  // 4. Heat / Temperature Assessment
  if (activity.relevantFactors.includes('heat')) {
    let tempPoints = 0;
    if (feelsLike >= 42 || temp >= 40) tempPoints = 30;
    else if (feelsLike >= 38 || temp >= 36) tempPoints = 20;
    else if (feelsLike >= 34 || temp >= 32) tempPoints = 10;
    else if (temp <= 10) tempPoints = 15;

    const weightedTemp = Math.round(tempPoints * activity.heatWeight);
    if (weightedTemp > 0) {
      baseScore += weightedTemp;
      factors.push({
        id: 'factor-heat',
        name: 'Temperature / Heat Index',
        icon: '🌡️',
        rawMetric: `${temp}°C (Feels ${feelsLike}°C)`,
        pointsAdded: weightedTemp,
        explanation: `🌡 High temperature (${temp}°C, feels ${feelsLike}°C) -> +${weightedTemp}`
      });
    }
  }

  // 5. Official Weather Warning Priority Assessment
  let warningOverrideActive = false;
  let warningDetails: string | undefined = undefined;

  if (alertSeverity && alertSeverity !== 'GREEN') {
    warningOverrideActive = true;
    warningDetails = alertTitle || `${alertSeverity} Weather Alert in effect`;

    let warningPoints = 0;
    if (alertSeverity === 'RED') {
      warningPoints = Math.round(45 * activity.warningWeight);
    } else if (alertSeverity === 'ORANGE') {
      warningPoints = Math.round(30 * activity.warningWeight);
    } else if (alertSeverity === 'YELLOW') {
      warningPoints = Math.round(15 * activity.warningWeight);
    }

    baseScore += warningPoints;

    factors.push({
      id: 'factor-warning',
      name: 'Official Weather Alert',
      icon: '⚠️',
      rawMetric: `${alertSeverity} ALERT`,
      pointsAdded: warningPoints,
      explanation: `⚠️ Active weather warning (${alertTitle || alertSeverity}) -> +${warningPoints}`,
      isWarningOverride: true
    });
  }

  // Clamp final score between 5 and 98
  const finalScore = Math.max(5, Math.min(98, baseScore));

  // Determine Level according to requested scale:
  // 0–20: LOW, 21–40: MODERATE, 41–60: ELEVATED, 61–80: HIGH, 81–100: SEVERE
  let riskLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'SEVERE' = 'LOW';
  if (finalScore >= 81) riskLevel = 'SEVERE';
  else if (finalScore >= 61) riskLevel = 'HIGH';
  else if (finalScore >= 41) riskLevel = 'ELEVATED';
  else if (finalScore >= 21) riskLevel = 'MODERATE';

  const { recommendation, explanation } = generateRecommendationText(
    activity,
    riskLevel,
    finalScore,
    warningOverrideActive,
    alertTitle
  );

  return {
    riskScore: finalScore,
    riskLevel,
    factors,
    warningOverrideActive,
    warningDetails,
    recommendation,
    explanation
  };
}

function generateRecommendationText(
  activity: ActivityConfig,
  riskLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'SEVERE',
  score: number,
  warningActive: boolean,
  warningTitle?: string
): { recommendation: string; explanation: string } {
  if (warningActive && (riskLevel === 'HIGH' || riskLevel === 'SEVERE')) {
    return {
      recommendation: `Official weather warning (${warningTitle || 'Alert'}) active for your selected location. Outdoor activity is not recommended during the selected period due to significant weather risk.`,
      explanation: `Official weather alerts take precedence in risk calculation.`
    };
  }

  switch (riskLevel) {
    case 'SEVERE':
      return {
        recommendation: `Outdoor activity is not recommended during the selected period due to significant weather risk.`,
        explanation: `Extreme weather factors present dangerous conditions for ${activity.name.toLowerCase()}.`
      };
    case 'HIGH':
      return {
        recommendation: `Consider postponing the activity or choosing another time.`,
        explanation: `Calculated risk score of ${score}/100 indicates significant potential weather disruption.`
      };
    case 'ELEVATED':
    case 'MODERATE':
      return {
        recommendation: `Conditions are generally manageable, but monitor the weather before starting.`,
        explanation: `Moderate precipitation, wind, or thermal factors observed.`
      };
    case 'LOW':
    default:
      return {
        recommendation: `Conditions appear favorable for this activity during the selected period.`,
        explanation: `Weather forecast projects clear, safe conditions.`
      };
  }
}
