/**
 * ForecastAdvisoryProvider
 *
 * A global weather-derived advisory engine that works for ANY location worldwide.
 * It fetches the live forecast for the selected location and evaluates deterministic
 * thresholds to produce a GREEN / YELLOW / ORANGE / RED advisory.
 *
 * This is clearly labeled as a FORECAST ADVISORY — NOT an official government warning.
 * Official warnings only come from configured providers (e.g. ImdAlertProvider with a
 * real API endpoint).
 *
 * Architecture:
 *   Location coords → fetchOpenMeteoForecast → evaluate thresholds → WeatherAlert
 *
 * Thresholds are centralised here (not scattered in components) and are deterministic.
 */

import { AlertProvider } from './alertProviderInterface';
import { LocationSearchResult, fetchOpenMeteoForecast } from '../weatherProviders/openMeteoProvider';
import { WeatherAlert, AlertSeverity, WeatherEventType } from '../../types/alert';

// ─────────────────────────────────────────────────────────────────────────────
// Advisory severity thresholds (deterministic, documented, centralised)
// ─────────────────────────────────────────────────────────────────────────────
const THRESHOLDS = {
  RED: {
    rainProbWithStorm: 90,  // % — combined with thunderstorm/heavy-rain condition
    windSpeed: 60,           // km/h
    heatTemp: 46,            // °C max temperature
    heatFeelsLike: 49,       // °C feels-like
    coldTemp: -10,           // °C minimum temperature
    rainProbAlone: 95,       // % — extreme rain even without storm label
  },
  ORANGE: {
    rainProb: 70,            // %
    windSpeed: 40,           // km/h
    heatTemp: 41,            // °C
    heatFeelsLike: 44,       // °C feels-like
    coldTemp: -2,            // °C
  },
  YELLOW: {
    rainProb: 50,            // %
    windSpeed: 25,           // km/h
    heatTemp: 36,            // °C
    heatFeelsLike: 39,       // °C feels-like
    coldTemp: 5,             // °C
  },
} as const;

interface AdvisoryResult {
  severity: AlertSeverity;
  eventType: WeatherEventType;
  eventTypeName: string;
  title: string;
  description: string;
  recommendedAction: string;
  reasonSummary: string;
}

export class ForecastAdvisoryProvider implements AlertProvider {
  name = 'WeatherGPT Forecast Advisory';
  isDemo = true; // Always advisory — never an official government warning

  async getAlertsForLocation(location: LocationSearchResult): Promise<WeatherAlert[]> {
    try {
      const payload = await fetchOpenMeteoForecast(
        location.name,
        location.admin1 || location.country,
        location.country,
        location.latitude,
        location.longitude,
        location.timezone
      );

      const { weather, hourly, daily } = payload;

      // ── Aggregate worst-case conditions from current + next 12 hours + today's daily ──
      const next12h = hourly.slice(0, 12);

      const maxRainProb = Math.max(
        weather.precipitationRisk ?? 0,
        ...next12h.map((h) => h.precipitationProbability),
        daily[0]?.rainProbability ?? 0
      );
      const maxWindSpeed = Math.max(
        weather.windSpeed ?? 0,
        ...next12h.map((h) => h.windSpeed)
      );
      const maxTemp = Math.max(
        weather.temp ?? 25,
        weather.high ?? weather.temp ?? 25,
        daily[0]?.high ?? 0
      );
      const minTemp = Math.min(
        weather.temp ?? 25,
        weather.low ?? weather.temp ?? 25,
        daily[0]?.low ?? 99
      );
      const feelsLike = weather.feelsLike ?? weather.temp ?? 25;
      const conditionText = (weather.condition ?? '').toLowerCase();
      const conditionCode = weather.conditionCode ?? 'clear';

      const isThunderstorm =
        conditionText.includes('thunder') ||
        conditionText.includes('lightning') ||
        conditionText.includes('storm') ||
        conditionText.includes('squall') ||
        conditionCode === 'thunder';
      const isHeavyRain =
        conditionText.includes('heavy rain') ||
        conditionText.includes('downpour') ||
        conditionText.includes('torrential') ||
        conditionText.includes('flood');
      const isFog =
        conditionText.includes('fog') ||
        conditionText.includes('mist') ||
        conditionCode === 'fog';

      const advisory = this.evaluate(
        maxRainProb,
        maxWindSpeed,
        maxTemp,
        minTemp,
        feelsLike,
        isThunderstorm,
        isHeavyRain,
        isFog,
        location
      );

      const now = new Date();
      const validUntil = new Date(now.getTime() + 12 * 60 * 60 * 1000);

      return [
        {
          id: `advisory-${location.latitude.toFixed(3)}-${location.longitude.toFixed(3)}-${now.getTime()}`,
          source: 'WeatherGPT Forecast Advisory',
          isDemo: true,
          location: {
            name: location.name,
            district: location.admin1 || location.name,
            state: location.admin1 || location.country,
            latitude: location.latitude,
            longitude: location.longitude,
          },
          severity: advisory.severity,
          eventType: advisory.eventType,
          eventTypeName: advisory.eventTypeName,
          title: advisory.title,
          description: advisory.description,
          validFrom: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          validUntil: validUntil.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          issuedAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendedAction: advisory.recommendedAction,
          sourceUrl: undefined,
          status: 'ACTIVE',
          whyExplanation:
            `Forecast advisory for ${location.name} (${location.latitude.toFixed(2)}°, ` +
            `${location.longitude.toFixed(2)}°). ` +
            `Reason: ${advisory.reasonSummary}. ` +
            `Rain: ${maxRainProb}%, Wind: ${maxWindSpeed} km/h, Temp: ${maxTemp}°C.`,
        },
      ];
    } catch (error) {
      console.warn('[ForecastAdvisoryProvider] Could not fetch forecast. Defaulting to GREEN.', error);
      return [this.buildGreenAlert(location)];
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Deterministic severity evaluation
  // ─────────────────────────────────────────────────────────────────────────
  private evaluate(
    rainProb: number,
    windSpeed: number,
    maxTemp: number,
    minTemp: number,
    feelsLike: number,
    isThunderstorm: boolean,
    isHeavyRain: boolean,
    isFog: boolean,
    location: LocationSearchResult
  ): AdvisoryResult {
    const loc = location.name;

    // ── RED ──────────────────────────────────────────────────────────────────
    if (windSpeed >= THRESHOLDS.RED.windSpeed) {
      return {
        severity: 'RED', eventType: 'STRONG_WINDS', eventTypeName: 'Extreme Winds',
        title: 'RED ADVISORY: Extreme Wind Warning',
        description: `Extremely dangerous wind speeds of ${windSpeed} km/h detected near ${loc}. Risk of structural damage and severe outdoor hazards.`,
        recommendedAction: 'Stay indoors. Secure all loose objects. Avoid all outdoor activity.',
        reasonSummary: `Extreme wind: ${windSpeed} km/h`,
      };
    }
    if (maxTemp >= THRESHOLDS.RED.heatTemp || feelsLike >= THRESHOLDS.RED.heatFeelsLike) {
      return {
        severity: 'RED', eventType: 'HEATWAVE', eventTypeName: 'Extreme Heat',
        title: 'RED ADVISORY: Extreme Heat Warning',
        description: `Extremely dangerous heat detected near ${loc}. Temperature ${maxTemp}°C, feels like ${feelsLike}°C. Severe risk of heat stroke.`,
        recommendedAction: 'Stay indoors in a cool environment. Drink plenty of water. Do not exercise outdoors.',
        reasonSummary: `Extreme heat: ${maxTemp}°C / feels ${feelsLike}°C`,
      };
    }
    if (minTemp <= THRESHOLDS.RED.coldTemp) {
      return {
        severity: 'RED', eventType: 'COLD_WAVE', eventTypeName: 'Extreme Cold',
        title: 'RED ADVISORY: Extreme Cold Warning',
        description: `Dangerously cold conditions near ${loc}. Temperature ${minTemp}°C. Severe risk of frostbite and hypothermia.`,
        recommendedAction: 'Avoid prolonged outdoor exposure. Wear heavy insulation. Check on vulnerable individuals.',
        reasonSummary: `Extreme cold: ${minTemp}°C`,
      };
    }
    if (
      (rainProb >= THRESHOLDS.RED.rainProbWithStorm && (isThunderstorm || isHeavyRain)) ||
      rainProb >= THRESHOLDS.RED.rainProbAlone
    ) {
      return {
        severity: 'RED', eventType: 'EXTREMELY_HEAVY_RAIN', eventTypeName: 'Extreme Rainfall',
        title: 'RED ADVISORY: Extreme Rainfall & Storm Warning',
        description: `Extremely high precipitation risk (${rainProb}%) with severe storm conditions near ${loc}. High flood risk.`,
        recommendedAction: 'Avoid all outdoor activity. Stay away from low-lying flood-prone areas. Follow emergency guidance.',
        reasonSummary: `Extreme rain: ${rainProb}% + storm conditions`,
      };
    }

    // ── ORANGE ───────────────────────────────────────────────────────────────
    if (maxTemp >= THRESHOLDS.ORANGE.heatTemp || feelsLike >= THRESHOLDS.ORANGE.heatFeelsLike) {
      return {
        severity: 'ORANGE', eventType: 'HEATWAVE', eventTypeName: 'Severe Heat',
        title: 'ORANGE ADVISORY: Severe Heat Warning',
        description: `Severe heat conditions near ${loc}. Temperature ${maxTemp}°C, feels like ${feelsLike}°C. Significant health risk for outdoor activity.`,
        recommendedAction: 'Limit outdoor exposure. Drink adequate water. Avoid direct sun from 12:00–16:00.',
        reasonSummary: `Severe heat: ${maxTemp}°C / feels ${feelsLike}°C`,
      };
    }
    if (minTemp <= THRESHOLDS.ORANGE.coldTemp) {
      return {
        severity: 'ORANGE', eventType: 'COLD_WAVE', eventTypeName: 'Severe Cold',
        title: 'ORANGE ADVISORY: Cold Weather Warning',
        description: `Severe cold conditions near ${loc}. Temperature ${minTemp}°C. Significant risk of cold-related illness.`,
        recommendedAction: 'Dress warmly in layers. Minimise unnecessary outdoor exposure.',
        reasonSummary: `Severe cold: ${minTemp}°C`,
      };
    }
    if (windSpeed >= THRESHOLDS.ORANGE.windSpeed) {
      return {
        severity: 'ORANGE', eventType: 'STRONG_WINDS', eventTypeName: 'Strong Winds',
        title: 'ORANGE ADVISORY: Strong Wind Warning',
        description: `Strong winds (${windSpeed} km/h) expected near ${loc}. Risk of transport disruption and outdoor hazards.`,
        recommendedAction: 'Secure outdoor furniture. Drive cautiously. Avoid exposed elevated areas.',
        reasonSummary: `Strong wind: ${windSpeed} km/h`,
      };
    }
    if (rainProb >= THRESHOLDS.ORANGE.rainProb && isThunderstorm) {
      return {
        severity: 'ORANGE', eventType: 'THUNDERSTORM', eventTypeName: 'Thunderstorm',
        title: 'ORANGE ADVISORY: Thunderstorm & Heavy Rain Warning',
        description: `Severe thunderstorm with high precipitation risk (${rainProb}%) near ${loc}.`,
        recommendedAction: 'Avoid outdoor activity during storms. Do not shelter under trees. Avoid waterlogged areas.',
        reasonSummary: `Thunderstorm + rain: ${rainProb}%`,
      };
    }
    if (rainProb >= THRESHOLDS.ORANGE.rainProb) {
      return {
        severity: 'ORANGE', eventType: 'HEAVY_RAIN', eventTypeName: 'Heavy Rainfall',
        title: 'ORANGE ADVISORY: Heavy Rainfall Warning',
        description: `Very high precipitation probability (${rainProb}%) detected near ${loc}. Potential for localised flooding.`,
        recommendedAction: 'Avoid low-lying flood-prone areas. Drive cautiously. Carry waterproof gear.',
        reasonSummary: `Heavy rain: ${rainProb}%`,
      };
    }

    // ── YELLOW ───────────────────────────────────────────────────────────────
    if (isFog) {
      return {
        severity: 'YELLOW', eventType: 'DENSE_FOG', eventTypeName: 'Reduced Visibility',
        title: 'YELLOW ADVISORY: Reduced Visibility',
        description: `Fog or mist conditions may reduce visibility near ${loc}. Exercise caution when driving.`,
        recommendedAction: 'Use fog lights. Reduce driving speed. Maintain a safe following distance.',
        reasonSummary: 'Fog/mist conditions detected',
      };
    }
    if (isThunderstorm) {
      return {
        severity: 'YELLOW', eventType: 'THUNDERSTORM', eventTypeName: 'Thunderstorm Watch',
        title: 'YELLOW ADVISORY: Thunderstorm Watch',
        description: `Moderate thunderstorm activity possible near ${loc}. Monitor weather updates.`,
        recommendedAction: 'Stay updated on radar observations. Have a shelter plan ready for outdoor activities.',
        reasonSummary: 'Thunderstorm conditions present',
      };
    }
    if (maxTemp >= THRESHOLDS.YELLOW.heatTemp || feelsLike >= THRESHOLDS.YELLOW.heatFeelsLike) {
      return {
        severity: 'YELLOW', eventType: 'HEATWAVE', eventTypeName: 'Heat Advisory',
        title: 'YELLOW ADVISORY: Heat Alert',
        description: `Warm conditions near ${loc}. Temperature ${maxTemp}°C, feels like ${feelsLike}°C. Moderate concern for outdoor activities.`,
        recommendedAction: 'Stay hydrated. Wear sunscreen. Avoid prolonged outdoor exposure during peak heat hours.',
        reasonSummary: `Heat: ${maxTemp}°C / feels ${feelsLike}°C`,
      };
    }
    if (minTemp <= THRESHOLDS.YELLOW.coldTemp) {
      return {
        severity: 'YELLOW', eventType: 'COLD_WAVE', eventTypeName: 'Cold Advisory',
        title: 'YELLOW ADVISORY: Cold Weather Advisory',
        description: `Cool-to-cold conditions near ${loc}. Temperature ${minTemp}°C. Take precautions for outdoor activities.`,
        recommendedAction: 'Layer up. Limit prolonged outdoor exposure in cold conditions.',
        reasonSummary: `Cold: ${minTemp}°C`,
      };
    }
    if (windSpeed >= THRESHOLDS.YELLOW.windSpeed) {
      return {
        severity: 'YELLOW', eventType: 'STRONG_WINDS', eventTypeName: 'Windy Conditions',
        title: 'YELLOW ADVISORY: Windy Conditions',
        description: `Moderate-to-strong winds (${windSpeed} km/h) expected near ${loc}. May affect outdoor activities.`,
        recommendedAction: 'Secure loose outdoor objects. Exercise caution when driving tall vehicles.',
        reasonSummary: `Moderate wind: ${windSpeed} km/h`,
      };
    }
    if (rainProb >= THRESHOLDS.YELLOW.rainProb) {
      return {
        severity: 'YELLOW', eventType: 'HEAVY_RAIN', eventTypeName: 'Rainfall Advisory',
        title: 'YELLOW ADVISORY: Rainfall Advisory',
        description: `Moderate-to-high rainfall probability (${rainProb}%) expected near ${loc}. Carry rain gear.`,
        recommendedAction: 'Carry an umbrella. Drive cautiously on wet roads. Monitor local forecasts.',
        reasonSummary: `Moderate-high rain: ${rainProb}%`,
      };
    }

    // ── GREEN ────────────────────────────────────────────────────────────────
    return {
      severity: 'GREEN', eventType: 'NONE', eventTypeName: 'No Severe Weather',
      title: 'GREEN — No Severe Weather Advisory',
      description: `No significant weather hazards detected near ${loc}. Conditions appear favourable.`,
      recommendedAction: 'No emergency action required. Continue monitoring official updates.',
      reasonSummary: `Normal: Rain ${rainProb}%, Wind ${windSpeed} km/h, Temp ${maxTemp}°C`,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Safe GREEN fallback when forecast fetch fails
  // ─────────────────────────────────────────────────────────────────────────
  private buildGreenAlert(location: LocationSearchResult): WeatherAlert {
    const now = new Date();
    const ts = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      id: `advisory-green-${location.latitude.toFixed(3)}-${location.longitude.toFixed(3)}`,
      source: 'WeatherGPT Forecast Advisory',
      isDemo: true,
      location: {
        name: location.name,
        district: location.admin1 || location.name,
        state: location.admin1 || location.country,
        latitude: location.latitude,
        longitude: location.longitude,
      },
      severity: 'GREEN',
      eventType: 'NONE',
      eventTypeName: 'No Severe Weather',
      title: 'GREEN — No Active Advisory',
      description: 'Forecast data could not be retrieved for this location. No advisory has been issued.',
      validFrom: ts,
      validUntil: ts,
      issuedAt: ts,
      recommendedAction: 'No emergency action required.',
      status: 'ACTIVE',
      whyExplanation: `Forecast unavailable for ${location.name}. No advisory issued.`,
    };
  }
}
