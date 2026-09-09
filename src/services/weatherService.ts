/**
 * Weather Service Unified Facade
 * Delegates forecast queries to active weather providers (Open-Meteo default).
 * Manages localStorage caching, location persistence, and exposes location context for AI modules.
 */

import {
  searchLocationsOpenMeteo,
  fetchOpenMeteoForecast,
  reverseGeocodeOpenMeteo,
  LocationSearchResult,
  OpenMeteoForecastPayload
} from './weatherProviders/openMeteoProvider';
import { WeatherData, HourlyForecastItem, DailyForecastItem } from '../data/mockWeatherData';
import { WeatherContext, WeatherIntent } from '../types/chatContext';

export interface LocationWeatherContext {
  location: LocationSearchResult;
  weather: WeatherData;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  source: string;
  isCached: boolean;
  cachedAt?: string;
}

const STORAGE_KEY_LOCATION = 'weathergpt_last_location';
const STORAGE_KEY_CACHE = 'weathergpt_cached_forecast';

// Active Context Container
let activeContext: LocationWeatherContext | null = null;

export function getActiveWeatherContext(): LocationWeatherContext | null {
  return activeContext;
}

/**
 * 1. searchLocation / searchLocations
 */
export async function searchLocation(query: string): Promise<LocationSearchResult[]> {
  return await searchLocationsOpenMeteo(query);
}

export async function searchLocations(query: string): Promise<LocationSearchResult[]> {
  return await searchLocation(query);
}

/**
 * 2. getCurrentLocation - Browser Geolocation API
 * Prompt Req 2: Request browser location permission, retrieve lat/long, store selected coordinates.
 * If user denies permission: throws "Location access was denied. Please search for your city."
 */
export async function getCurrentLocation(): Promise<LocationSearchResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser. Please search for your city.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const location = await reverseGeocodeOpenMeteo(lat, lon);
          resolve(location);
        } catch (err) {
          reject(err);
        }
      },
      (error) => {
        let msg = 'Location access was denied. Please search for your city.';
        if (error.code === error.POSITION_UNAVAILABLE) msg = 'Location information is unavailable. Please search for your city.';
        if (error.code === error.TIMEOUT) msg = 'Location request timed out. Please search for your city.';
        reject(new Error(msg));
      },
      { timeout: 10000 }
    );
  });
}

/**
 * Fetch Weather Forecast for selected location
 */
export async function fetchWeatherForLocation(location: LocationSearchResult): Promise<LocationWeatherContext> {
  try {
    // Save selected location persistence
    localStorage.setItem(STORAGE_KEY_LOCATION, JSON.stringify(location));

    const payload: OpenMeteoForecastPayload = await fetchOpenMeteoForecast(
      location.name,
      location.admin1 || location.country,
      location.country,
      location.latitude,
      location.longitude,
      location.timezone
    );

    const context: LocationWeatherContext = {
      location,
      weather: payload.weather,
      hourly: payload.hourly,
      daily: payload.daily,
      source: payload.source,
      isCached: false
    };

    // Cache successful forecast
    localStorage.setItem(
      STORAGE_KEY_CACHE,
      JSON.stringify({
        context,
        savedAt: new Date().toLocaleString()
      })
    );

    activeContext = context;
    return context;

  } catch (error) {
    console.warn('[WeatherService] Live API request failed. Checking cache...', error);

    // Fallback to LocalStorage Cached Payload if API fails or offline
    const cachedData = localStorage.getItem(STORAGE_KEY_CACHE);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        const cachedContext: LocationWeatherContext = {
          ...parsed.context,
          isCached: true,
          cachedAt: parsed.savedAt
        };
        activeContext = cachedContext;
        return cachedContext;
      } catch (e) {
        console.error('Failed to parse cached weather:', e);
      }
    }

    throw error;
  }
}

/**
 * 3. getWeather(location)
 */
export async function getWeather(location: LocationSearchResult): Promise<LocationWeatherContext> {
  return await fetchWeatherForLocation(location);
}

/**
 * 4. fetchWeatherForCurrentLocation()
 */
export async function fetchWeatherForCurrentLocation(): Promise<LocationWeatherContext> {
  const location = await getCurrentLocation();
  return await fetchWeatherForLocation(location);
}

/**
 * 5. getWeatherContext(location)
 * Requirement 8: Create a Weather Context Object
 */
export async function getWeatherContext(
  targetLoc?: LocationSearchResult,
  intent: WeatherIntent = 'GENERAL_WEATHER',
  requestedTime: string = 'now'
): Promise<WeatherContext> {
  let loc = targetLoc;

  if (!loc) {
    const activeCtx = getActiveWeatherContext();
    if (activeCtx) {
      loc = activeCtx.location;
    } else {
      const savedLoc = localStorage.getItem(STORAGE_KEY_LOCATION);
      if (savedLoc) {
        try {
          loc = JSON.parse(savedLoc);
        } catch {
          loc = getDefaultCityLocation('Chennai');
        }
      } else {
        loc = getDefaultCityLocation('Chennai');
      }
    }
  }

  const weatherCtx = await fetchWeatherForLocation(loc!);
  const { weather, hourly, daily, source, isCached, cachedAt } = weatherCtx;

  return {
    location: {
      name: weatherCtx.location.name,
      latitude: weatherCtx.location.latitude,
      longitude: weatherCtx.location.longitude,
      admin1: weatherCtx.location.admin1,
      country: weatherCtx.location.country
    },
    current: {
      temperature: weather.temp,
      feelsLike: weather.feelsLike,
      humidity: weather.humidity,
      windSpeed: weather.windSpeed,
      precipitation: weather.precipitationRisk,
      weatherCondition: weather.condition,
      high: weather.high,
      low: weather.low
    },
    hourly,
    daily,
    requestedTime,
    intent,
    provider: source,
    retrievedAt: weather.updatedAt,
    isCached,
    cachedAt
  };
}

/**
 * Backward compatibility wrappers
 */
export async function fetchCurrentWeather(city: string = 'mumbai'): Promise<WeatherData> {
  const lastLocationStr = localStorage.getItem(STORAGE_KEY_LOCATION);
  let location: LocationSearchResult;

  if (lastLocationStr) {
    try {
      location = JSON.parse(lastLocationStr);
    } catch {
      location = getDefaultCityLocation(city);
    }
  } else {
    location = getDefaultCityLocation(city);
  }

  const context = await fetchWeatherForLocation(location);
  return context.weather;
}

export async function fetchHourlyForecast(city: string = 'mumbai'): Promise<HourlyForecastItem[]> {
  if (activeContext) return activeContext.hourly;
  const context = await fetchWeatherForLocation(getDefaultCityLocation(city));
  return context.hourly;
}

export async function fetch7DayForecast(city: string = 'mumbai'): Promise<DailyForecastItem[]> {
  if (activeContext) return activeContext.daily;
  const context = await fetchWeatherForLocation(getDefaultCityLocation(city));
  return context.daily;
}

export function getDefaultCityLocation(cityName: string): LocationSearchResult {
  const normalized = cityName.toLowerCase().trim();
  const cityCoordinates: Record<string, { lat: number; lon: number; state: string }> = {
    mumbai: { lat: 19.076, lon: 72.8777, state: 'Maharashtra' },
    delhi: { lat: 28.6139, lon: 77.209, state: 'NCR' },
    bengaluru: { lat: 12.9716, lon: 77.5946, state: 'Karnataka' },
    chennai: { lat: 13.0827, lon: 80.2707, state: 'Tamil Nadu' },
    pune: { lat: 18.5204, lon: 73.8567, state: 'Maharashtra' },
    shimla: { lat: 31.1048, lon: 77.1734, state: 'Himachal Pradesh' },
    hyderabad: { lat: 17.385, lon: 78.4867, state: 'Telangana' },
    kanchipuram: { lat: 12.8342, lon: 79.7036, state: 'Tamil Nadu' },
    coimbatore: { lat: 11.0168, lon: 76.9558, state: 'Tamil Nadu' }
  };

  const found = cityCoordinates[normalized] || { lat: 13.0827, lon: 80.2707, state: 'Tamil Nadu' };

  return {
    id: Date.now(),
    name: cityName.charAt(0).toUpperCase() + cityName.slice(1),
    latitude: found.lat,
    longitude: found.lon,
    country: 'India',
    admin1: found.state,
    timezone: 'Asia/Kolkata'
  };
}

