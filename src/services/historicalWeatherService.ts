import { LocationSearchResult } from './weatherProviders/openMeteoProvider';

export interface HistoricalTelemetryPoint {
  date: string;
  avgTemp: number | null;
  maxTemp: number | null;
  minTemp: number | null;
  precipitation: number | null;
  humidity: number | null;
}

export interface ClimateComparisonResult {
  isAvailable: boolean;
  errorMessage?: string;
  location: LocationSearchResult;
  periodLabel: string;
  startStr: string;
  endStr: string;
  currentAvgTemp: number | null;
  baselineAvgTemp: number | null;
  tempDiff: number | null;
  tempDiffLabel: string;
  currentTotalRain: number | null;
  baselineTotalRain: number | null;
  rainDiff: number | null;
  rainDiffLabel: string;
  currentAvgHumidity: number | null;
  baselineAvgHumidity: number | null;
  humidityDiff: number | null;
  trendData: HistoricalTelemetryPoint[];
  dataSource: string;
  retrievedAt: string;
}

export interface MultiYearComparisonPoint {
  year: number;
  periodLabel: string;
  avgTemp: number | null;
  maxTemp: number | null;
  minTemp: number | null;
  totalRainfall: number | null;
  avgHumidity: number | null;
}

export interface MultiYearComparisonResult {
  isAvailable: boolean;
  errorMessage?: string;
  location: LocationSearchResult;
  metric: 'TEMPERATURE' | 'RAINFALL' | 'HUMIDITY' | 'ALL';
  years: MultiYearComparisonPoint[];
  dataSource: string;
  retrievedAt: string;
}

export interface DualLocationComparisonResult {
  isAvailable: boolean;
  errorMessage?: string;
  locationA: LocationSearchResult;
  locationB: LocationSearchResult;
  periodLabel: string;
  dataA: ClimateComparisonResult;
  dataB: ClimateComparisonResult;
  summary: string;
  dataSource: string;
  retrievedAt: string;
}

// In-memory cache for historical API responses to optimize performance (Req 42)
const climateCache = new Map<string, { data: ClimateComparisonResult; timestamp: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache

/**
 * 1. Fetch Main Historical Climate Data with Real Baseline from Open-Meteo Archive API
 */
export async function fetchHistoricalClimateData(
  location: LocationSearchResult,
  range: '7days' | '30days' | '3months' | '6months' | '1year' | '3years' = '30days'
): Promise<ClimateComparisonResult> {
  const cacheKey = `${location.id}_${location.latitude}_${location.longitude}_${range}`;
  const cached = climateCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // Calculate Date Boundaries
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 2); // Open-Meteo archive delay ~2 days

  const startDate = new Date(endDate);
  if (range === '7days') startDate.setDate(endDate.getDate() - 7);
  else if (range === '30days') startDate.setDate(endDate.getDate() - 30);
  else if (range === '3months') startDate.setDate(endDate.getDate() - 90);
  else if (range === '6months') startDate.setDate(endDate.getDate() - 180);
  else if (range === '1year') startDate.setDate(endDate.getDate() - 365);
  else startDate.setDate(endDate.getDate() - 1095); // 3 years

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  try {
    // 1. Fetch current target period from Open-Meteo Archive API
    const currentUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${location.latitude}&longitude=${location.longitude}&start_date=${startStr}&end_date=${endStr}&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean&timezone=auto`;

    const res = await fetch(currentUrl);
    if (!res.ok) {
      return makeUnavailableResult(location, range, `Open-Meteo Archive API status ${res.status}`);
    }

    const data = await res.json();
    if (!data.daily || !Array.isArray(data.daily.time) || data.daily.time.length === 0) {
      return makeUnavailableResult(location, range, "Historical weather data is not available from the current data provider.");
    }

    const daily = data.daily;
    const dates: string[] = daily.time || [];
    const means: (number | null)[] = daily.temperature_2m_mean || [];
    const maxs: (number | null)[] = daily.temperature_2m_max || [];
    const mins: (number | null)[] = daily.temperature_2m_min || [];
    const rains: (number | null)[] = daily.precipitation_sum || [];
    const humidities: (number | null)[] = daily.relative_humidity_2m_mean || [];

    const trendData: HistoricalTelemetryPoint[] = dates.map((d, i) => ({
      date: d,
      avgTemp: means[i] !== null && means[i] !== undefined ? Math.round(means[i]!) : null,
      maxTemp: maxs[i] !== null && maxs[i] !== undefined ? Math.round(maxs[i]!) : null,
      minTemp: mins[i] !== null && mins[i] !== undefined ? Math.round(mins[i]!) : null,
      precipitation: rains[i] !== null && rains[i] !== undefined ? parseFloat(rains[i]!.toFixed(1)) : null,
      humidity: humidities[i] !== null && humidities[i] !== undefined ? Math.round(humidities[i]!) : null
    }));

    // Calculate current period metrics (using non-null values)
    const validTemps = trendData.map((p) => p.avgTemp).filter((v): v is number => v !== null);
    const currentAvgTemp = validTemps.length > 0
      ? parseFloat((validTemps.reduce((acc, v) => acc + v, 0) / validTemps.length).toFixed(1))
      : null;

    const validRains = trendData.map((p) => p.precipitation).filter((v): v is number => v !== null);
    const currentTotalRain = validRains.length > 0
      ? parseFloat(validRains.reduce((acc, v) => acc + v, 0).toFixed(1))
      : null;

    const validHumidities = trendData.map((p) => p.humidity).filter((v): v is number => v !== null);
    const currentAvgHumidity = validHumidities.length > 0
      ? Math.round(validHumidities.reduce((acc, v) => acc + v, 0) / validHumidities.length)
      : null;

    // 2. Fetch Historical Baseline for SAME date window from Previous 3 Years via Archive API
    const baseStart = new Date(startDate);
    baseStart.setFullYear(baseStart.getFullYear() - 3);
    const baseEnd = new Date(endDate);
    baseEnd.setFullYear(baseEnd.getFullYear() - 1);

    const baseStartStr = baseStart.toISOString().split('T')[0];
    const baseEndStr = baseEnd.toISOString().split('T')[0];

    let baselineAvgTemp: number | null = null;
    let baselineTotalRain: number | null = null;
    let baselineAvgHumidity: number | null = null;

    try {
      const baselineUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${location.latitude}&longitude=${location.longitude}&start_date=${baseStartStr}&end_date=${baseEndStr}&daily=temperature_2m_mean,precipitation_sum,relative_humidity_2m_mean&timezone=auto`;
      const baseRes = await fetch(baselineUrl);
      if (baseRes.ok) {
        const baseData = await baseRes.json();
        const baseDaily = baseData.daily || {};
        const bMeans: number[] = (baseDaily.temperature_2m_mean || []).filter((v: any) => typeof v === 'number');
        const bRains: number[] = (baseDaily.precipitation_sum || []).filter((v: any) => typeof v === 'number');
        const bHumidities: number[] = (baseDaily.relative_humidity_2m_mean || []).filter((v: any) => typeof v === 'number');

        if (bMeans.length > 0) {
          baselineAvgTemp = parseFloat((bMeans.reduce((a, b) => a + b, 0) / bMeans.length).toFixed(1));
        }

        if (bRains.length > 0) {
          // Normalize annual total rain over equivalent window duration
          const daysRatio = trendData.length / Math.max(1, bRains.length / 3);
          baselineTotalRain = parseFloat((bRains.reduce((a, b) => a + b, 0) * daysRatio / 3).toFixed(1));
        }

        if (bHumidities.length > 0) {
          baselineAvgHumidity = Math.round(bHumidities.reduce((a, b) => a + b, 0) / bHumidities.length);
        }
      }
    } catch (e) {
      console.warn('Baseline API query deferred:', e);
    }

    // Differences & Labels
    const tempDiff = currentAvgTemp !== null && baselineAvgTemp !== null
      ? parseFloat((currentAvgTemp - baselineAvgTemp).toFixed(1))
      : null;

    const rainDiff = currentTotalRain !== null && baselineTotalRain !== null
      ? parseFloat((currentTotalRain - baselineTotalRain).toFixed(1))
      : null;

    const humidityDiff = currentAvgHumidity !== null && baselineAvgHumidity !== null
      ? currentAvgHumidity - baselineAvgHumidity
      : null;

    const tempDiffLabel = tempDiff !== null
      ? (tempDiff >= 0
        ? `📈 +${tempDiff}°C above historical baseline`
        : `📉 ${tempDiff}°C below historical baseline`)
      : 'Not enough historical data is available to calculate a reliable baseline.';

    const rainDiffLabel = rainDiff !== null
      ? (rainDiff >= 0
        ? `🌧️ +${rainDiff} mm above historical rainfall baseline`
        : `☀️ ${Math.abs(rainDiff)} mm below historical rainfall baseline`)
      : 'Not enough historical data is available to calculate a rainfall baseline.';

    const result: ClimateComparisonResult = {
      isAvailable: true,
      location,
      periodLabel: `Past ${range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : range === '3months' ? '3 Months' : range === '6months' ? '6 Months' : range === '1year' ? '1 Year' : '3 Years'} (${startStr} to ${endStr})`,
      startStr,
      endStr,
      currentAvgTemp,
      baselineAvgTemp,
      tempDiff,
      tempDiffLabel,
      currentTotalRain,
      baselineTotalRain,
      rainDiff,
      rainDiffLabel,
      currentAvgHumidity,
      baselineAvgHumidity,
      humidityDiff,
      trendData,
      dataSource: 'Open-Meteo ERA5 Historical Archive API',
      retrievedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    climateCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (err: any) {
    console.error('Failed to query Open-Meteo archive:', err);
    return makeUnavailableResult(location, range, "Historical weather data is not available from the current data provider.");
  }
}

/**
 * 2. Helper function to return explicit unavailable state without fabrication
 */
function makeUnavailableResult(
  location: LocationSearchResult,
  range: string,
  reason: string
): ClimateComparisonResult {
  return {
    isAvailable: false,
    errorMessage: "Historical weather data is not available from the current data provider.",
    location,
    periodLabel: `Past ${range}`,
    startStr: '',
    endStr: '',
    currentAvgTemp: null,
    baselineAvgTemp: null,
    tempDiff: null,
    tempDiffLabel: 'Historical baseline unavailable',
    currentTotalRain: null,
    baselineTotalRain: null,
    rainDiff: null,
    rainDiffLabel: 'Rainfall baseline unavailable',
    currentAvgHumidity: null,
    baselineAvgHumidity: null,
    humidityDiff: null,
    trendData: [],
    dataSource: `Open-Meteo Archive API (${reason})`,
    retrievedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

/**
 * 3. Specific Interface Functions Required by Step 4 Spec:
 */
export async function getHistoricalWeather(location: LocationSearchResult, dateRange: '7days' | '30days' | '3months' | '1year' = '30days') {
  return await fetchHistoricalClimateData(location, dateRange);
}

export async function getHistoricalTemperature(location: LocationSearchResult, dateRange: '7days' | '30days' | '3months' | '1year' = '30days') {
  const full = await fetchHistoricalClimateData(location, dateRange);
  return {
    isAvailable: full.isAvailable,
    currentAvgTemp: full.currentAvgTemp,
    baselineAvgTemp: full.baselineAvgTemp,
    tempDiff: full.tempDiff,
    tempDiffLabel: full.tempDiffLabel,
    trendData: full.trendData.map(p => ({ date: p.date, avgTemp: p.avgTemp, maxTemp: p.maxTemp, minTemp: p.minTemp })),
    dataSource: full.dataSource,
    retrievedAt: full.retrievedAt
  };
}

export async function getHistoricalRainfall(location: LocationSearchResult, dateRange: '7days' | '30days' | '3months' | '1year' = '30days') {
  const full = await fetchHistoricalClimateData(location, dateRange);
  return {
    isAvailable: full.isAvailable,
    currentTotalRain: full.currentTotalRain,
    baselineTotalRain: full.baselineTotalRain,
    rainDiff: full.rainDiff,
    rainDiffLabel: full.rainDiffLabel,
    rainTrend: full.trendData.map(p => ({ date: p.date, precipitation: p.precipitation })),
    dataSource: full.dataSource,
    retrievedAt: full.retrievedAt
  };
}

export async function getHistoricalHumidity(location: LocationSearchResult, dateRange: '7days' | '30days' | '3months' | '1year' = '30days') {
  const full = await fetchHistoricalClimateData(location, dateRange);
  return {
    isAvailable: full.isAvailable && full.currentAvgHumidity !== null,
    currentAvgHumidity: full.currentAvgHumidity,
    baselineAvgHumidity: full.baselineAvgHumidity,
    humidityDiff: full.humidityDiff,
    humidityTrend: full.trendData.map(p => ({ date: p.date, humidity: p.humidity })),
    dataSource: full.dataSource,
    retrievedAt: full.retrievedAt
  };
}

export async function getHistoricalTrend(location: LocationSearchResult, dateRange: '7days' | '30days' | '3months' | '1year' = '30days') {
  const full = await fetchHistoricalClimateData(location, dateRange);
  // Calculate simple linear trend direction if sufficient data exists
  const temps = full.trendData.map(p => p.avgTemp).filter((t): t is number => t !== null);
  let trendDirection: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data' = 'insufficient_data';
  
  if (temps.length >= 7) {
    const firstHalf = temps.slice(0, Math.floor(temps.length / 2));
    const secondHalf = temps.slice(Math.floor(temps.length / 2));
    const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const diff = avg2 - avg1;

    if (diff > 0.5) trendDirection = 'increasing';
    else if (diff < -0.5) trendDirection = 'decreasing';
    else trendDirection = 'stable';
  }

  return {
    isAvailable: full.isAvailable,
    trendDirection,
    points: full.trendData,
    dataSource: full.dataSource,
    retrievedAt: full.retrievedAt
  };
}

/**
 * 4. Multi-Year Historical Comparison (Requirement 17)
 */
export async function fetchMultiYearComparison(
  location: LocationSearchResult,
  targetMonth: number = new Date().getMonth(), // 0 - 11
  years: number[] = [2023, 2024, 2025, 2026]
): Promise<MultiYearComparisonResult> {
  const points: MultiYearComparisonPoint[] = [];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[targetMonth];

  for (const yr of years) {
    const startDateStr = `${yr}-${String(targetMonth + 1).padStart(2, '0')}-01`;
    // Last day of month calculation
    const lastDay = new Date(yr, targetMonth + 1, 0).getDate();
    const endDateStr = `${yr}-${String(targetMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    try {
      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${location.latitude}&longitude=${location.longitude}&start_date=${startDateStr}&end_date=${endDateStr}&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean&timezone=auto`;
      const res = await fetch(url);
      if (res.ok) {
        const d = await res.json();
        const daily = d.daily || {};
        const means: number[] = (daily.temperature_2m_mean || []).filter((v: any) => typeof v === 'number');
        const maxs: number[] = (daily.temperature_2m_max || []).filter((v: any) => typeof v === 'number');
        const mins: number[] = (daily.temperature_2m_min || []).filter((v: any) => typeof v === 'number');
        const rains: number[] = (daily.precipitation_sum || []).filter((v: any) => typeof v === 'number');
        const humidities: number[] = (daily.relative_humidity_2m_mean || []).filter((v: any) => typeof v === 'number');

        if (means.length > 0) {
          points.push({
            year: yr,
            periodLabel: `${monthName} ${yr}`,
            avgTemp: parseFloat((means.reduce((a, b) => a + b, 0) / means.length).toFixed(1)),
            maxTemp: maxs.length > 0 ? Math.round(Math.max(...maxs)) : null,
            minTemp: mins.length > 0 ? Math.round(Math.min(...mins)) : null,
            totalRainfall: rains.length > 0 ? parseFloat(rains.reduce((a, b) => a + b, 0).toFixed(1)) : null,
            avgHumidity: humidities.length > 0 ? Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length) : null
          });
        }
      }
    } catch (e) {
      console.warn(`Failed to fetch year ${yr} multi-year data:`, e);
    }
  }

  if (points.length === 0) {
    return {
      isAvailable: false,
      errorMessage: "Historical weather data is not available from the current data provider for these years.",
      location,
      metric: 'ALL',
      years: [],
      dataSource: 'Open-Meteo ERA5 Historical Archive API',
      retrievedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }

  return {
    isAvailable: true,
    location,
    metric: 'ALL',
    years: points.sort((a, b) => a.year - b.year),
    dataSource: 'Open-Meteo ERA5 Historical Archive API',
    retrievedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

/**
 * 5. Dual Location Historical Comparison (Requirement 27 & 28)
 */
export async function getHistoricalComparison(
  locationA: LocationSearchResult,
  locationB: LocationSearchResult,
  dateRange: '7days' | '30days' | '3months' | '1year' = '30days'
): Promise<DualLocationComparisonResult> {
  const [dataA, dataB] = await Promise.all([
    fetchHistoricalClimateData(locationA, dateRange),
    fetchHistoricalClimateData(locationB, dateRange)
  ]);

  let summary = '';
  if (dataA.isAvailable && dataB.isAvailable && dataA.currentAvgTemp !== null && dataB.currentAvgTemp !== null) {
    const diff = parseFloat((dataA.currentAvgTemp - dataB.currentAvgTemp).toFixed(1));
    if (diff > 0) {
      summary = `Historically, **${locationA.name}** was warmer than **${locationB.name}** by ${Math.abs(diff)}°C over the past ${dateRange}.`;
    } else if (diff < 0) {
      summary = `Historically, **${locationB.name}** was warmer than **${locationA.name}** by ${Math.abs(diff)}°C over the past ${dateRange}.`;
    } else {
      summary = `Both **${locationA.name}** and **${locationB.name}** recorded identical average temperatures (${dataA.currentAvgTemp}°C) over the selected period.`;
    }
  } else {
    summary = `Historical comparison data is currently incomplete between ${locationA.name} and ${locationB.name}.`;
  }

  return {
    isAvailable: dataA.isAvailable && dataB.isAvailable,
    locationA,
    locationB,
    periodLabel: dataA.periodLabel,
    dataA,
    dataB,
    summary,
    dataSource: 'Open-Meteo ERA5 Historical Archive API',
    retrievedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

