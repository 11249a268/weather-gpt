import { WeatherIntent, TimeReference } from '../types/chatContext';

export function detectIntent(queryText: string): WeatherIntent {
  const q = queryText.toLowerCase().trim();

  // 0. Time Comparison Queries (Requirement 16 & 19)
  if (
    (q.includes('better') || q.includes('preferable') || q.includes('or')) &&
    (q.includes('morning') || q.includes('afternoon') || q.includes('evening') || q.includes('night')) &&
    (q.includes('travel') || q.includes('play') || q.includes('cricket') || q.includes('event') || q.includes('hike') || q.includes('bike'))
  ) {
    return 'TIME_COMPARISON_QUERY';
  }

  // 1. Activity & Decision Queries (Requirement 18 & 19)
  if (
    q.startsWith('can i') ||
    q.startsWith('should i') ||
    q.startsWith('is it good') ||
    q.startsWith('will my') ||
    q.includes('affected by') ||
    q.includes('good for') ||
    q.includes('safe to')
  ) {
    return 'DECISION_QUERY';
  }

  // 2. Warning & Alert Queries
  if (q.includes('warning') || q.includes('alert') || q.includes('advisory') || q.includes('watch') || q.includes('severe') || q.includes('near me') || q.includes('in my area')) {
    return 'WARNING_QUERY';
  }

  // 3. Agriculture / Farming
  if (q.includes('irrigate') || q.includes('crop') || q.includes('farm') || q.includes('field') || q.includes('water my crop') || q.includes('water crops') || q.includes('soil')) {
    return 'AGRICULTURE';
  }

  // 4. Event Planning / Gathering
  if (q.includes('event') || q.includes('college') || q.includes('gathering') || q.includes('party') || q.includes('wedding') || q.includes('function') || q.includes('conduct')) {
    return 'EVENT_PLANNING';
  }

  // 5. Outdoor Sports / Activity
  if (q.includes('sport') || q.includes('cricket') || q.includes('football') || q.includes('play') || q.includes('run') || q.includes('outdoor') || q.includes('match')) {
    return 'OUTDOOR_ACTIVITY';
  }

  // 6. Travel / Commute Decision
  if (q.includes('travel') || q.includes('commute') || q.includes('drive') || q.includes('ride') || q.includes('road') || q.includes('journey')) {
    return 'TRAVEL_DECISION';
  }

  // 7. Rain / Umbrella Query
  if (q.includes('rain') || q.includes('umbrella') || q.includes('raincoat') || q.includes('downpour') || q.includes('shower') || q.includes('drizzle') || q.includes('precipitation')) {
    return 'RAIN_QUERY';
  }

  // 8. Temperature Query / Hotter / Cooler
  if (q.includes('temp') || q.includes('hot') || q.includes('cold') || q.includes('degree') || q.includes('celsius') || q.includes('warm') || q.includes('cooler') || q.includes('hotter')) {
    return 'TEMPERATURE_QUERY';
  }

  // 9. Hourly Forecast / Time Horizon
  if (q.includes('next 3 hours') || q.includes('next three hours') || q.includes('hourly') || q.includes('next few hours') || q.includes('by 7') || q.includes('by 5')) {
    return 'HOURLY_FORECAST';
  }

  // 10. Daily / Tomorrow Forecast
  if (q.includes('tomorrow') || q.includes('7 day') || q.includes('next week') || q.includes('weekend')) {
    return 'DAILY_FORECAST';
  }

  // 11. Current Weather
  if (q.includes('now') || q.includes('right now') || q.includes('current') || q.includes('today') || q.includes('outside') || q.includes('weather right now') || q.includes('wind speed') || q.includes('humidity')) {
    return 'CURRENT_WEATHER';
  }

  return 'GENERAL_WEATHER';
}

export function extractTimeReference(queryText: string): TimeReference {
  const q = queryText.toLowerCase().trim();

  if (q.includes('tomorrow morning')) {
    return { period: 'tomorrow_morning', label: 'Tomorrow Morning (6 AM – 12 PM)' };
  }
  if (q.includes('tomorrow afternoon')) {
    return { period: 'tomorrow_afternoon', label: 'Tomorrow Afternoon (12 PM – 5 PM)' };
  }
  if (q.includes('tomorrow evening') || q.includes('tomorrow night')) {
    return { period: 'tomorrow_evening', label: 'Tomorrow Evening (5 PM – 10 PM)' };
  }
  if (q.includes('tomorrow')) {
    return { period: 'tomorrow_full', label: 'Tomorrow Full Day' };
  }
  if (q.includes('next 3 hours') || q.includes('next three hours')) {
    return { period: 'next_3_hours', label: 'Next 3 Hours' };
  }
  if (q.includes('at 7 am') || q.includes('7 am') || q.includes('7am')) {
    return { period: 'at_7_am', label: 'At 7:00 AM' };
  }
  if (q.includes('at 5 pm') || q.includes('5 pm') || q.includes('5pm')) {
    return { period: 'at_5_pm', label: 'At 5:00 PM' };
  }
  if (q.includes('tonight')) {
    return { period: 'tonight', label: 'Tonight (7 PM – 11 PM)' };
  }
  if (q.includes('today')) {
    return { period: 'today', label: 'Today' };
  }

  return { period: 'now', label: 'Current Observation' };
}

