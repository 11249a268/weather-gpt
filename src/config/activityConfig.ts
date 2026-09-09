export type ActivityId =
  | 'cricket'
  | 'football'
  | 'running'
  | 'cycling'
  | 'walking'
  | 'hiking'
  | 'camping'
  | 'outdoor_event'
  | 'photography'
  | 'outdoor_work'
  | 'road_travel'
  | 'bike_ride'
  | 'beach_visit'
  | 'picnic'
  | 'school_event'
  | 'construction'
  | 'custom';

export interface ActivityConfig {
  id: ActivityId;
  name: string;
  icon: string;
  description: string;
  category: 'travel' | 'sports' | 'events' | 'work' | 'leisure';
  relevantFactors: Array<'rain' | 'wind' | 'thunderstorm' | 'heat' | 'cold' | 'warnings' | 'visibility'>;
  rainWeight: number;
  windWeight: number;
  thunderWeight: number;
  heatWeight: number;
  warningWeight: number;
}

export const ACTIVITIES_CONFIG: Record<ActivityId, ActivityConfig> = {
  cricket: {
    id: 'cricket',
    name: 'Cricket',
    icon: '🏏',
    description: 'Cricket matches, pitch play, and outdoor practice',
    category: 'sports',
    relevantFactors: ['rain', 'thunderstorm', 'heat', 'wind', 'warnings'],
    rainWeight: 1.6,
    windWeight: 1.1,
    thunderWeight: 1.8,
    heatWeight: 1.3,
    warningWeight: 1.6
  },
  football: {
    id: 'football',
    name: 'Football',
    icon: '⚽',
    description: 'Football matches, training sessions, and turf play',
    category: 'sports',
    relevantFactors: ['rain', 'thunderstorm', 'heat', 'wind', 'warnings'],
    rainWeight: 1.4,
    windWeight: 1.1,
    thunderWeight: 1.7,
    heatWeight: 1.3,
    warningWeight: 1.5
  },
  running: {
    id: 'running',
    name: 'Running / Jogging',
    icon: '🏃',
    description: 'Outdoor marathons, morning jogging, and road runs',
    category: 'sports',
    relevantFactors: ['rain', 'heat', 'wind', 'thunderstorm', 'warnings'],
    rainWeight: 1.3,
    windWeight: 1.2,
    thunderWeight: 1.6,
    heatWeight: 1.5,
    warningWeight: 1.5
  },
  cycling: {
    id: 'cycling',
    name: 'Cycling',
    icon: '🚴',
    description: 'Road cycling, mountain biking, and fitness rides',
    category: 'sports',
    relevantFactors: ['rain', 'wind', 'visibility', 'heat', 'thunderstorm', 'warnings'],
    rainWeight: 1.5,
    windWeight: 1.6,
    thunderWeight: 1.6,
    heatWeight: 1.4,
    warningWeight: 1.6
  },
  walking: {
    id: 'walking',
    name: 'Walking',
    icon: '🚶',
    description: 'Casual walks, park strolls, and outdoor movement',
    category: 'leisure',
    relevantFactors: ['rain', 'heat', 'thunderstorm', 'warnings'],
    rainWeight: 1.2,
    windWeight: 1.0,
    thunderWeight: 1.5,
    heatWeight: 1.2,
    warningWeight: 1.4
  },
  hiking: {
    id: 'hiking',
    name: 'Hiking / Trekking',
    icon: '🥾',
    description: 'Mountain treks, trail hiking, and hill climbing',
    category: 'sports',
    relevantFactors: ['rain', 'thunderstorm', 'heat', 'wind', 'warnings'],
    rainWeight: 1.6,
    windWeight: 1.4,
    thunderWeight: 1.9,
    heatWeight: 1.4,
    warningWeight: 1.7
  },
  camping: {
    id: 'camping',
    name: 'Camping',
    icon: '🏕️',
    description: 'Overnight outdoor camping, tent stays, and campfires',
    category: 'leisure',
    relevantFactors: ['rain', 'thunderstorm', 'wind', 'cold', 'warnings'],
    rainWeight: 1.7,
    windWeight: 1.5,
    thunderWeight: 1.8,
    heatWeight: 1.2,
    warningWeight: 1.7
  },
  outdoor_event: {
    id: 'outdoor_event',
    name: 'Outdoor Event / Function',
    icon: '🎉',
    description: 'Weddings, parties, concerts, and outdoor gatherings',
    category: 'events',
    relevantFactors: ['rain', 'thunderstorm', 'wind', 'heat', 'warnings'],
    rainWeight: 1.6,
    windWeight: 1.3,
    thunderWeight: 1.7,
    heatWeight: 1.3,
    warningWeight: 1.6
  },
  photography: {
    id: 'photography',
    name: 'Photography / Sightseeing',
    icon: '📸',
    description: 'Outdoor photography, landscape shoots, and touring',
    category: 'leisure',
    relevantFactors: ['rain', 'thunderstorm', 'wind', 'warnings'],
    rainWeight: 1.3,
    windWeight: 1.1,
    thunderWeight: 1.5,
    heatWeight: 1.1,
    warningWeight: 1.4
  },
  outdoor_work: {
    id: 'outdoor_work',
    name: 'Outdoor Work / Agriculture',
    icon: '🌾',
    description: 'Agricultural farming, field operations, and outdoor labor',
    category: 'work',
    relevantFactors: ['rain', 'heat', 'wind', 'thunderstorm', 'warnings'],
    rainWeight: 1.4,
    windWeight: 1.2,
    thunderWeight: 1.6,
    heatWeight: 1.5,
    warningWeight: 1.5
  },
  road_travel: {
    id: 'road_travel',
    name: 'Road Travel / Highway Drive',
    icon: '🚗',
    description: 'Long-distance driving, road trips, and highway commute',
    category: 'travel',
    relevantFactors: ['rain', 'visibility', 'wind', 'thunderstorm', 'warnings'],
    rainWeight: 1.5,
    windWeight: 1.3,
    thunderWeight: 1.6,
    heatWeight: 0.9,
    warningWeight: 1.6
  },
  bike_ride: {
    id: 'bike_ride',
    name: 'Bike Travel / Two-Wheeler',
    icon: '🏍️',
    description: 'Motorcycle rides and two-wheeler highway travel',
    category: 'travel',
    relevantFactors: ['rain', 'wind', 'thunderstorm', 'warnings'],
    rainWeight: 1.7,
    windWeight: 1.6,
    thunderWeight: 1.7,
    heatWeight: 1.1,
    warningWeight: 1.7
  },
  beach_visit: {
    id: 'beach_visit',
    name: 'Beach Visit',
    icon: '🏖️',
    description: 'Coastal visits, swimming, and beach activities',
    category: 'leisure',
    relevantFactors: ['rain', 'thunderstorm', 'wind', 'warnings'],
    rainWeight: 1.4,
    windWeight: 1.6,
    thunderWeight: 1.8,
    heatWeight: 1.2,
    warningWeight: 1.8
  },
  picnic: {
    id: 'picnic',
    name: 'Picnic',
    icon: '🧺',
    description: 'Park picnics, family outings, and garden lunches',
    category: 'leisure',
    relevantFactors: ['rain', 'thunderstorm', 'heat', 'wind', 'warnings'],
    rainWeight: 1.5,
    windWeight: 1.2,
    thunderWeight: 1.6,
    heatWeight: 1.3,
    warningWeight: 1.5
  },
  school_event: {
    id: 'school_event',
    name: 'College / School Event',
    icon: '🎓',
    description: 'Campus festivals, sports meets, and outdoor assemblies',
    category: 'events',
    relevantFactors: ['rain', 'thunderstorm', 'wind', 'heat', 'warnings'],
    rainWeight: 1.4,
    windWeight: 1.2,
    thunderWeight: 1.6,
    heatWeight: 1.3,
    warningWeight: 1.6
  },
  construction: {
    id: 'construction',
    name: 'Construction Work',
    icon: '🏗️',
    description: 'Building construction, scaffolding, and site labor',
    category: 'work',
    relevantFactors: ['heat', 'rain', 'wind', 'thunderstorm', 'warnings'],
    rainWeight: 1.4,
    windWeight: 1.5,
    thunderWeight: 1.8,
    heatWeight: 1.7,
    warningWeight: 1.7
  },
  custom: {
    id: 'custom',
    name: 'Custom Activity',
    icon: '💡',
    description: 'User-defined custom outdoor activity',
    category: 'leisure',
    relevantFactors: ['rain', 'thunderstorm', 'wind', 'heat', 'warnings'],
    rainWeight: 1.3,
    windWeight: 1.2,
    thunderWeight: 1.5,
    heatWeight: 1.2,
    warningWeight: 1.5
  }
};

export function classifyActivityText(input: string): ActivityConfig {
  const q = input.toLowerCase().trim();

  if (q.includes('cricket')) return ACTIVITIES_CONFIG.cricket;
  if (q.includes('football') || q.includes('soccer')) return ACTIVITIES_CONFIG.football;
  if (q.includes('run') || q.includes('jog') || q.includes('marathon')) return ACTIVITIES_CONFIG.running;
  if (q.includes('cycl') || q.includes('bicycle')) return ACTIVITIES_CONFIG.cycling;
  if (q.includes('walk')) return ACTIVITIES_CONFIG.walking;
  if (q.includes('hike') || q.includes('trek')) return ACTIVITIES_CONFIG.hiking;
  if (q.includes('camp') || q.includes('tent')) return ACTIVITIES_CONFIG.camping;
  if (q.includes('beach') || q.includes('coast') || q.includes('sea')) return ACTIVITIES_CONFIG.beach_visit;
  if (q.includes('picnic')) return ACTIVITIES_CONFIG.picnic;
  if (q.includes('construct') || q.includes('site') || q.includes('build')) return ACTIVITIES_CONFIG.construction;
  if (q.includes('wedding') || q.includes('party') || q.includes('event') || q.includes('function')) return ACTIVITIES_CONFIG.outdoor_event;
  if (q.includes('college') || q.includes('school')) return ACTIVITIES_CONFIG.school_event;
  if (q.includes('farm') || q.includes('agri') || q.includes('crop')) return ACTIVITIES_CONFIG.outdoor_work;
  if (q.includes('drive') || q.includes('road') || q.includes('car')) return ACTIVITIES_CONFIG.road_travel;
  if (q.includes('bike') || q.includes('motorcycle') || q.includes('ride')) return ACTIVITIES_CONFIG.bike_ride;
  if (q.includes('photo') || q.includes('visit') || q.includes('shoot')) return ACTIVITIES_CONFIG.photography;

  return {
    ...ACTIVITIES_CONFIG.custom,
    name: input.trim() ? `Custom: "${input.trim()}"` : 'General Outdoor Activity'
  };
}
