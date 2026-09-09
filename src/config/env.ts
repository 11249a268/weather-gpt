/**
 * WeatherGPT Environment & Integration Configuration
 * Controls feature flags and API key retrieval for live vs mock services.
 */

export interface EnvConfig {
  isMockMode: boolean;
  alertProvider?: string;
  weatherApiKey?: string;
  weatherApiBaseUrl?: string;
  geminiApiKey?: string;
  aiModelName?: string;
  imdAlertApiUrl?: string;
  climateApiKey?: string;
  voiceApiKey?: string;
  region: string;
}

export const config: EnvConfig = {
  // Mock mode is enabled by default for Step 1
  isMockMode: import.meta.env.VITE_ENABLE_MOCK_MODE !== 'false',
  alertProvider: import.meta.env.VITE_ALERT_PROVIDER || 'demo',
  weatherApiKey: import.meta.env.VITE_OPENWEATHER_API_KEY || '',
  weatherApiBaseUrl: import.meta.env.VITE_WEATHER_API_BASE_URL || 'https://api.openweathermap.org/data/2.5',
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  aiModelName: import.meta.env.VITE_AI_MODEL_NAME || 'gemini-1.5-pro',
  imdAlertApiUrl: import.meta.env.VITE_IMD_ALERT_API_URL || '',
  climateApiKey: import.meta.env.VITE_CLIMATE_DATA_API_KEY || '',
  voiceApiKey: import.meta.env.VITE_VOICE_SPEECH_RECOGNITION_KEY || '',
  region: import.meta.env.VITE_APP_REGION || 'India',
};

// Helper logger to monitor environment state
console.info(
  `[WeatherGPT Environment] Mode: ${config.isMockMode ? 'MOCK DATA' : 'LIVE API'}, Region: ${config.region}`
);
