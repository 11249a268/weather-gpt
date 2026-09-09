/**
 * WeatherGPT Centralized Mock Data Layer
 * Separates data payload definitions from UI components.
 * Real weather APIs & Gemini AI response models will map directly onto these types.
 */

export interface WeatherData {
  city: string;
  state: string;
  country: string;
  temp: number; // in Celsius
  feelsLike: number;
  condition: string;
  conditionCode: 'rain' | 'thunder' | 'cloudy' | 'clear' | 'fog' | 'extreme';
  high: number;
  low: number;
  humidity: number; // percentage
  windSpeed: number; // km/h
  windDirection: string;
  uvIndex: number;
  aqi: number;
  aqiStatus: 'Good' | 'Moderate' | 'Unhealthy' | 'Hazardous';
  visibility: number; // km
  pressure: number; // hPa
  dewPoint: number;
  precipitationRisk: number; // percentage
  updatedAt: string;
  sunrise?: string;
  sunset?: string;
  summary?: string;
}

export interface HourlyForecastItem {
  time: string;
  datetimeISO?: string; // ISO timestamp for date-aware selection by Risk Analyzer
  temp: number;
  conditionCode: 'rain' | 'thunder' | 'cloudy' | 'clear' | 'fog' | 'extreme';
  precipitationProbability: number; // %
  windSpeed: number; // km/h
}

export interface DailyForecastItem {
  day: string;
  date: string;
  high: number;
  low: number;
  condition: string;
  conditionCode: 'rain' | 'thunder' | 'cloudy' | 'clear' | 'fog' | 'extreme';
  rainProbability: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
}

export interface RiskAnalysis {
  overallScore: number; // 0 - 100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  primaryRiskFactor: string;
  factors: {
    name: string;
    score: number; // 0-100
    impact: string;
  }[];
}

export interface AIRecommendation {
  id: string;
  queryContext?: string;
  summary: string;
  travelAdvisory: string;
  clothingTips: string[];
  safetyPrecautions: string[];
  carryItems: string[];
  alternativeTiming?: string;
  confidenceScore: number; // percentage e.g. 94%
}

export interface WeatherAlert {
  id: string;
  title: string;
  severity: 'Advisory' | 'Watch' | 'Warning' | 'Emergency';
  district: string;
  issuedBy: string;
  issuedAt: string;
  validUntil: string;
  description: string;
  recommendedAction: string;
}

export interface ClimateInsight {
  id: string;
  region: string;
  rainfallAnomalyPct: number; // e.g. +34% above 10yr avg
  tempDeparture: number; // e.g. +1.8°C
  monsoonOutlook: string;
  historicalComparison: string;
  extremeEventsCountThisYear: number;
}

export interface UserProfile {
  name: string;
  role: 'Commuter' | 'Farmer' | 'Event Planner' | 'Traveler' | 'Logistics Manager';
  primaryCity: string;
  secondaryCities: string[];
  riskSensitivity: 'Low' | 'Moderate' | 'High';
  notificationPreferences: {
    severeWeatherSMS: boolean;
    dailyAIAdvisory: boolean;
    travelDisruptionAlerts: boolean;
  };
  language: string;
}

// Default City Mock Data
export const MOCK_CITIES_WEATHER: Record<string, WeatherData> = {
  mumbai: {
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    temp: 29,
    feelsLike: 34,
    condition: 'Heavy Thunderstorms Likely',
    conditionCode: 'thunder',
    high: 31,
    low: 26,
    humidity: 88,
    windSpeed: 28,
    windDirection: 'SW',
    uvIndex: 4,
    aqi: 65,
    aqiStatus: 'Moderate',
    visibility: 4.5,
    pressure: 1008,
    dewPoint: 25,
    precipitationRisk: 85,
    updatedAt: 'Just now (Mock Data)'
  },
  delhi: {
    city: 'New Delhi',
    state: 'NCR',
    country: 'India',
    temp: 36,
    feelsLike: 41,
    condition: 'Dense Heat & Dust Haze',
    conditionCode: 'fog',
    high: 39,
    low: 28,
    humidity: 52,
    windSpeed: 14,
    windDirection: 'WNW',
    uvIndex: 9,
    aqi: 245,
    aqiStatus: 'Unhealthy',
    visibility: 3.0,
    pressure: 1004,
    dewPoint: 21,
    precipitationRisk: 15,
    updatedAt: 'Just now (Mock Data)'
  },
  bengaluru: {
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    temp: 24,
    feelsLike: 24,
    condition: 'Pleasant & Light Breeze',
    conditionCode: 'cloudy',
    high: 27,
    low: 20,
    humidity: 71,
    windSpeed: 18,
    windDirection: 'ENE',
    uvIndex: 6,
    aqi: 42,
    aqiStatus: 'Good',
    visibility: 9.0,
    pressure: 1014,
    dewPoint: 18,
    precipitationRisk: 30,
    updatedAt: 'Just now (Mock Data)'
  },
  pune: {
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    temp: 27,
    feelsLike: 29,
    condition: 'Moderate Rain Showers',
    conditionCode: 'rain',
    high: 29,
    low: 22,
    humidity: 82,
    windSpeed: 22,
    windDirection: 'WSW',
    uvIndex: 5,
    aqi: 58,
    aqiStatus: 'Good',
    visibility: 6.0,
    pressure: 1010,
    dewPoint: 23,
    precipitationRisk: 75,
    updatedAt: 'Just now (Mock Data)'
  },
  shimla: {
    city: 'Shimla',
    state: 'Himachal Pradesh',
    country: 'India',
    temp: 16,
    feelsLike: 15,
    condition: 'Dense Fog & Mountain Chill',
    conditionCode: 'fog',
    high: 19,
    low: 11,
    humidity: 91,
    windSpeed: 10,
    windDirection: 'N',
    uvIndex: 7,
    aqi: 22,
    aqiStatus: 'Good',
    visibility: 2.0,
    pressure: 1018,
    dewPoint: 14,
    precipitationRisk: 60,
    updatedAt: 'Just now (Mock Data)'
  }
};

export const MOCK_HOURLY_FORECAST: HourlyForecastItem[] = [
  { time: 'Now', temp: 29, conditionCode: 'thunder', precipitationProbability: 85, windSpeed: 28 },
  { time: '21:00', temp: 28, conditionCode: 'rain', precipitationProbability: 80, windSpeed: 26 },
  { time: '22:00', temp: 27, conditionCode: 'rain', precipitationProbability: 75, windSpeed: 24 },
  { time: '23:00', temp: 27, conditionCode: 'cloudy', precipitationProbability: 40, windSpeed: 20 },
  { time: '00:00', temp: 26, conditionCode: 'cloudy', precipitationProbability: 30, windSpeed: 18 },
  { time: '01:00', temp: 26, conditionCode: 'clear', precipitationProbability: 15, windSpeed: 15 },
  { time: '06:00', temp: 25, conditionCode: 'clear', precipitationProbability: 10, windSpeed: 12 },
  { time: '09:00', temp: 28, conditionCode: 'cloudy', precipitationProbability: 25, windSpeed: 16 },
  { time: '12:00', temp: 31, conditionCode: 'thunder', precipitationProbability: 70, windSpeed: 22 },
  { time: '15:00', temp: 30, conditionCode: 'rain', precipitationProbability: 90, windSpeed: 30 },
  { time: '18:00', temp: 28, conditionCode: 'thunder', precipitationProbability: 85, windSpeed: 25 }
];

export const MOCK_DAILY_FORECAST: DailyForecastItem[] = [
  { day: 'Today', date: 'Sat, 29 Aug', high: 31, low: 26, condition: 'Heavy Thunderstorms', conditionCode: 'thunder', rainProbability: 85, riskLevel: 'High' },
  { day: 'Sun', date: '30 Aug', high: 30, low: 25, condition: 'Continuous Monsoon Rain', conditionCode: 'rain', rainProbability: 90, riskLevel: 'Severe' },
  { day: 'Mon', date: '31 Aug', high: 29, low: 24, condition: 'Scattered Light Rain', conditionCode: 'rain', rainProbability: 60, riskLevel: 'Moderate' },
  { day: 'Tue', date: '01 Sep', high: 31, low: 25, condition: 'Partly Cloudy & Breeze', conditionCode: 'cloudy', rainProbability: 30, riskLevel: 'Low' },
  { day: 'Wed', date: '02 Sep', high: 32, low: 26, condition: 'Clear Sky & High Humidity', conditionCode: 'clear', rainProbability: 20, riskLevel: 'Low' },
  { day: 'Thu', date: '03 Sep', high: 30, low: 25, condition: 'Evening Thundershowers', conditionCode: 'thunder', rainProbability: 70, riskLevel: 'Moderate' },
  { day: 'Fri', date: '04 Sep', high: 29, low: 24, condition: 'Heavy Downpour', conditionCode: 'rain', rainProbability: 85, riskLevel: 'High' }
];

export const MOCK_RISK_ANALYSIS: RiskAnalysis = {
  overallScore: 78,
  riskLevel: 'High',
  primaryRiskFactor: 'Flash Flood & Suburban Traffic Waterlogging Risk',
  factors: [
    { name: 'Heavy Downpour Rate', score: 85, impact: 'Intense rain expected between 15:00 - 19:00' },
    { name: 'Wind Squall / Gusts', score: 65, impact: 'Sudden gusts up to 45 km/h near coastal highways' },
    { name: 'Lightning Hazards', score: 72, impact: 'High cloud-to-ground electrical strikes during commute' },
    { name: 'Road Visibility', score: 60, impact: 'Reduced to under 2 km during peak evening rainfall' }
  ]
};

export const MOCK_AI_RECOMMENDATION: AIRecommendation = {
  id: 'rec-001',
  queryContext: 'Commute from Western Suburbs to South Mumbai between 4:00 PM and 7:00 PM',
  summary: 'Rain is highly likely during your planned travel hours. Suburban traffic waterlogging and local train delays are probable.',
  travelAdvisory: 'Depart before 3:00 PM or delay travel past 8:30 PM when rainfall intensity drops by 45%.',
  clothingTips: [
    'Wear quick-dry synthetic clothing and waterproof footwear with high grip.',
    'Avoid long flowy fabrics near flooded footpaths.'
  ],
  safetyPrecautions: [
    'Avoid low-lying underpasses like Milan Subway and Hindmata.',
    'Keep power banks charged; potential suburban power feeder trips.',
    'Do not shelter under tall trees or metal hoardings during lightning.'
  ],
  carryItems: ['Sturdy Windproof Umbrella', 'Waterproof Laptop Sleeve', 'Emergency Power Bank', 'Reflective Raincoat'],
  alternativeTiming: 'Optimal low-risk travel window: 13:00 - 14:30 PM',
  confidenceScore: 94
};

export const MOCK_WEATHER_ALERTS: WeatherAlert[] = [
  {
    id: 'alert-01',
    title: 'ORANGE ALERT: Heavy to Very Heavy Rainfall Warning',
    severity: 'Warning',
    district: 'Mumbai Suburban & Thane',
    issuedBy: 'India Meteorological Department (IMD) - Regional Centre',
    issuedAt: '29 Aug 2026, 14:30 IST',
    validUntil: '30 Aug 2026, 18:00 IST',
    description: 'Monsoon surge over North Konkan is intensifying. Isolated extremely heavy rainfall (>20 cm in 24 hrs) accompanied by gusty winds reaching 45-55 km/h.',
    recommendedAction: 'Residents are advised to restrict non-essential travel. Disasters management teams deployed in vulnerable low-lying districts.'
  },
  {
    id: 'alert-02',
    title: 'YELLOW WATCH: High Wave & Coastal Turbulence Alert',
    severity: 'Watch',
    district: 'Konkan Coastline',
    issuedBy: 'INCOIS Ocean Information Services',
    issuedAt: '29 Aug 2026, 10:00 IST',
    validUntil: '31 Aug 2026, 23:50 IST',
    description: 'High sea waves in the range of 3.5 to 4.2 meters forecasted along Konkan shoreline during high tide at 16:42 IST.',
    recommendedAction: 'Fishermen and tourists strongly cautioned against venturing into sea waters.'
  },
  {
    id: 'alert-03',
    title: 'GREEN ADVISORY: Seasonal Drainage & Health Protocol',
    severity: 'Advisory',
    district: 'Pune & Western Ghats',
    issuedBy: 'District Disaster Management Authority',
    issuedAt: '28 Aug 2026, 09:00 IST',
    validUntil: '02 Sep 2026, 18:00 IST',
    description: 'Increased runoff into catchment dams. Controlled release may occur at Khadakwasla spillway.',
    recommendedAction: 'Communities near riverbanks should stay alert to sirens and local official broadcasts.'
  }
];

export const MOCK_CLIMATE_INSIGHTS: ClimateInsight[] = [
  {
    id: 'clim-01',
    region: 'Western Ghats & Konkan Belt',
    rainfallAnomalyPct: +38,
    tempDeparture: +1.4,
    monsoonOutlook: 'Above Normal Monsoon Spells Driven by positive Indian Ocean Dipole (IOD).',
    historicalComparison: 'Current August precipitation exceeds 10-year mean by 38% due to back-to-back low-pressure systems.',
    extremeEventsCountThisYear: 14
  },
  {
    id: 'clim-02',
    region: 'Indo-Gangetic Plains (NCR & UP)',
    rainfallAnomalyPct: -18,
    tempDeparture: +2.1,
    monsoonOutlook: 'Subdued precipitation causing extended humid heat spells.',
    historicalComparison: 'Nighttime temperatures are 2.1°C warmer than 30-year climatological baseline.',
    extremeEventsCountThisYear: 9
  }
];

export const MOCK_USER_PROFILE: UserProfile = {
  name: 'Aarav Sharma',
  role: 'Commuter',
  primaryCity: 'Mumbai',
  secondaryCities: ['Pune', 'Bengaluru'],
  riskSensitivity: 'High',
  notificationPreferences: {
    severeWeatherSMS: true,
    dailyAIAdvisory: true,
    travelDisruptionAlerts: true
  },
  language: 'English (Hindi & Marathi available in Step 2)'
};
