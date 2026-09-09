/**
 * Open-Meteo Weather Data Provider
 * Fetches live meteorological forecast telemetry & geocoding location search.
 * Free public API - No API keys required.
 */

import { mapWmoCodeToInfo } from '../../utils/weatherCodeMapper';
import { WeatherData, HourlyForecastItem, DailyForecastItem } from '../../data/mockWeatherData';

export interface LocationSearchResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // State / Region
  timezone: string;
}

export interface OpenMeteoForecastPayload {
  weather: WeatherData;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  timezone: string;
  source: string;
  retrievedAt: string;
}

/**
 * 1. Location Search via Open-Meteo Geocoding API
 */
export async function searchLocationsOpenMeteo(query: string): Promise<LocationSearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  // Fetch more results so relevance sorting has a good pool to work with
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=20&language=en&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo Geocoding failed: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.results || !Array.isArray(data.results)) {
    return [];
  }

  const normalized = query.trim().toLowerCase();

  const results: LocationSearchResult[] = data.results.map((item: any) => ({
    id: item.id,
    name: item.name,
    latitude: item.latitude,
    longitude: item.longitude,
    country: item.country || '',
    admin1: item.admin1 || '',
    timezone: item.timezone || 'UTC'
  }));

  // Client-side relevance re-ranking:
  // Score each result by how closely its name matches the query.
  // Higher score = ranked earlier. Does NOT remove any results.
  const scored = results.map((loc) => {
    const nameLower = loc.name.toLowerCase();
    const admin1Lower = (loc.admin1 || '').toLowerCase();
    let score = 0;
    // Exact name match (case-insensitive)
    if (nameLower === normalized) score += 100;
    // Name starts with query
    else if (nameLower.startsWith(normalized)) score += 60;
    // Name contains query
    else if (nameLower.includes(normalized)) score += 30;
    // admin1 exact match (e.g. searching for a state name)
    if (admin1Lower === normalized) score += 50;
    else if (admin1Lower.startsWith(normalized)) score += 20;
    return { loc, score };
  });

  // Sort by score descending, preserving API order for ties
  scored.sort((a, b) => b.score - a.score);

  return scored.map((s) => s.loc);
}

/**
 * 2. Reverse Geocode via Open-Meteo Geocoding
 */
export async function reverseGeocodeOpenMeteo(lat: number, lon: number): Promise<LocationSearchResult> {
  // Simple fallback reverse lookup using bigdatacloud free API or Open-Meteo search
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    if (res.ok) {
      const d = await res.json();
      return {
        id: Date.now(),
        name: d.city || d.locality || d.principalSubdivision || 'Current Location',
        latitude: lat,
        longitude: lon,
        country: d.countryName || 'India',
        admin1: d.principalSubdivision || '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'
      };
    }
  } catch (e) {
    console.warn('Reverse geocode fallback:', e);
  }

  return {
    id: Date.now(),
    name: 'Current Location',
    latitude: lat,
    longitude: lon,
    country: 'India',
    admin1: '',
    timezone: 'Asia/Kolkata'
  };
}

/**
 * 3. Fetch Forecast via Open-Meteo Forecast API
 */
export async function fetchOpenMeteoForecast(
  locationName: string,
  stateName: string,
  countryName: string,
  lat: number,
  lon: number,
  timezone: string = 'auto'
): Promise<OpenMeteoForecastPayload> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,rain_sum,sunrise,sunset&timezone=${encodeURIComponent(timezone)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo Forecast API failed with status ${response.status}`);
  }

  const data = await response.json();
  const current = data.current || {};
  const hourlyData = data.hourly || {};
  const dailyData = data.daily || {};

  const currentWmo = mapWmoCodeToInfo(current.weather_code ?? 0);
  const now = new Date();
  const retrievedTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const rawSunrise = dailyData.sunrise?.[0];
  const rawSunset = dailyData.sunset?.[0];
  const sunriseStr = rawSunrise ? new Date(rawSunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:15 AM';
  const sunsetStr = rawSunset ? new Date(rawSunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:35 PM';

  // Transform Current Weather
  const weather: WeatherData = {
    city: locationName,
    state: stateName,
    country: countryName,
    temp: Math.round(current.temperature_2m ?? 28),
    feelsLike: Math.round(current.apparent_temperature ?? current.temperature_2m ?? 30),
    condition: currentWmo.description,
    conditionCode: currentWmo.conditionCode,
    high: Math.round(dailyData.temperature_2m_max?.[0] ?? current.temperature_2m + 3),
    low: Math.round(dailyData.temperature_2m_min?.[0] ?? current.temperature_2m - 4),
    humidity: current.relative_humidity_2m ?? 70,
    windSpeed: Math.round(current.wind_speed_10m ?? 12),
    windDirection: getCardinalWindDirection(current.wind_direction_10m ?? 180),
    uvIndex: 6, // Open-Meteo UV require separate param
    aqi: 55,
    aqiStatus: 'Good',
    visibility: 8.5,
    pressure: Math.round(current.surface_pressure ?? 1012),
    dewPoint: Math.round((current.temperature_2m ?? 25) - ((100 - (current.relative_humidity_2m ?? 70)) / 5)),
    precipitationRisk: dailyData.precipitation_probability_max?.[0] ?? (current.precipitation ? 90 : 25),
    updatedAt: `Live (${retrievedTimeStr})`,
    sunrise: sunriseStr,
    sunset: sunsetStr
  };

  // Transform Hourly Forecast (Next 24 Hours)
  const hourly: HourlyForecastItem[] = [];
  const times: string[] = hourlyData.time || [];
  const currentHourIdx = times.findIndex((t) => new Date(t) >= now) || 0;
  const targetIndices = Array.from({ length: 72 }, (_, i) => i).filter((idx) => idx < times.length);

  targetIndices.forEach((idx, i) => {
    const timeISO = times[idx];
    const hourLabel = new Date(timeISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const codeInfo = mapWmoCodeToInfo(hourlyData.weather_code?.[idx] ?? 0);

    hourly.push({
      time: hourLabel,
      datetimeISO: timeISO, // Raw ISO timestamp for date-aware risk calculation
      temp: Math.round(hourlyData.temperature_2m?.[idx] ?? 28),
      conditionCode: codeInfo.conditionCode,
      precipitationProbability: hourlyData.precipitation_probability?.[idx] ?? 20,
      windSpeed: Math.round(hourlyData.wind_speed_10m?.[idx] ?? 12)
    });
  });

  // Transform Daily Forecast (Next 7 Days)
  const daily: DailyForecastItem[] = [];
  const dailyTimes: string[] = dailyData.time || [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  dailyTimes.slice(0, 7).forEach((timeStr, idx) => {
    const dateObj = new Date(timeStr);
    const dayLabel = idx === 0 ? 'Today' : daysOfWeek[dateObj.getDay()];
    const dateFormatted = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const codeInfo = mapWmoCodeToInfo(dailyData.weather_code?.[idx] ?? 0);
    const rainProb = dailyData.precipitation_probability_max?.[idx] ?? 30;

    let riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe' = 'Low';
    if (rainProb >= 85) riskLevel = 'Severe';
    else if (rainProb >= 65) riskLevel = 'High';
    else if (rainProb >= 40) riskLevel = 'Moderate';

    daily.push({
      day: dayLabel,
      date: dateFormatted,
      high: Math.round(dailyData.temperature_2m_max?.[idx] ?? 30),
      low: Math.round(dailyData.temperature_2m_min?.[idx] ?? 22),
      condition: codeInfo.description,
      conditionCode: codeInfo.conditionCode,
      rainProbability: rainProb,
      riskLevel
    });
  });

  return {
    weather,
    hourly,
    daily,
    timezone: data.timezone || timezone,
    source: 'Open-Meteo',
    retrievedAt: new Date().toISOString()
  };
}

function getCardinalWindDirection(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(deg / 45) % 8];
}
