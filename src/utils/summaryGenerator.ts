import { WeatherData } from '../data/mockWeatherData';

/**
 * Deterministic "Today's Weather Summary" Generator
 * Synthesizes a factual, concise natural-language summary based strictly on retrieved weather telemetry.
 * The AI NEVER fabricates temperature, rainfall, or conditions.
 */
export function generateTodaysWeatherSummary(weather: WeatherData): string {
  const { temp, feelsLike, condition, precipitationRisk, windSpeed, windDirection, high, low, city } = weather;

  let conditionDesc = condition.toLowerCase();
  let tempTrend = temp >= 33 ? 'hot' : temp >= 28 ? 'warm' : temp >= 20 ? 'pleasant' : 'cool';
  let tempDiffText = Math.abs(feelsLike - temp) >= 2 ? ` (feels like ${feelsLike}°C)` : '';

  let skyText = `Today in ${city}, weather will remain ${conditionDesc} with ${tempTrend} conditions around ${temp}°C${tempDiffText}.`;

  let rainText = '';
  if (precipitationRisk >= 60) {
    rainText = ` High chance of rainfall (${precipitationRisk}%) is expected during the day; carry an umbrella if heading outdoors.`;
  } else if (precipitationRisk >= 30) {
    rainText = ` Moderate precipitation risk (${precipitationRisk}%) exists later in the day.`;
  } else {
    rainText = ` Precipitation probability remains low at ${precipitationRisk}%.`;
  }

  let windText = '';
  if (windSpeed >= 20) {
    windText = ` Breezy winds at ${windSpeed} km/h from the ${windDirection}.`;
  } else {
    windText = ` Light winds around ${windSpeed} km/h (${windDirection}).`;
  }

  return `${skyText}${rainText}${windText}`;
}
