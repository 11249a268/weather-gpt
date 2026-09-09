/**
 * WMO Weather Interpretation Codes (WW) Mapper
 * Maps Open-Meteo weather codes (0 - 99) to human-readable descriptions,
 * condition categories, and visual icon identifiers.
 */

export interface WeatherCodeInfo {
  description: string;
  conditionCode: 'clear' | 'cloudy' | 'fog' | 'rain' | 'thunder';
}

export function mapWmoCodeToInfo(code: number): WeatherCodeInfo {
  switch (code) {
    case 0:
      return { description: 'Clear Sky', conditionCode: 'clear' };
    case 1:
      return { description: 'Mainly Clear', conditionCode: 'clear' };
    case 2:
      return { description: 'Partly Cloudy', conditionCode: 'cloudy' };
    case 3:
      return { description: 'Overcast', conditionCode: 'cloudy' };
    case 45:
    case 48:
      return { description: 'Dense Fog & Haze', conditionCode: 'fog' };
    case 51:
      return { description: 'Light Drizzle', conditionCode: 'rain' };
    case 53:
      return { description: 'Moderate Drizzle', conditionCode: 'rain' };
    case 55:
      return { description: 'Dense Drizzle', conditionCode: 'rain' };
    case 56:
    case 57:
      return { description: 'Freezing Drizzle', conditionCode: 'rain' };
    case 61:
      return { description: 'Slight Rain Showers', conditionCode: 'rain' };
    case 63:
      return { description: 'Moderate Rain', conditionCode: 'rain' };
    case 65:
      return { description: 'Heavy Downpour', conditionCode: 'rain' };
    case 66:
    case 67:
      return { description: 'Freezing Rain', conditionCode: 'rain' };
    case 71:
    case 73:
    case 75:
    case 77:
      return { description: 'Snowfall', conditionCode: 'fog' };
    case 80:
      return { description: 'Slight Rain Showers', conditionCode: 'rain' };
    case 81:
      return { description: 'Moderate Rain Spells', conditionCode: 'rain' };
    case 82:
      return { description: 'Violent Rain Downpour', conditionCode: 'rain' };
    case 85:
    case 86:
      return { description: 'Snow Showers', conditionCode: 'fog' };
    case 95:
      return { description: 'Thunderstorm', conditionCode: 'thunder' };
    case 96:
    case 99:
      return { description: 'Thunderstorm with Severe Hail', conditionCode: 'thunder' };
    default:
      return { description: 'Passing Showers', conditionCode: 'rain' };
  }
}
