import { AlertProvider } from './alertProviderInterface';
import { LocationSearchResult } from '../weatherProviders/openMeteoProvider';
import { WeatherAlert, AlertSeverity, WeatherEventType } from '../../types/alert';

export class DemoAlertProvider implements AlertProvider {
  name = 'Demo Warning Provider';
  isDemo = true;

  async getAlertsForLocation(location: LocationSearchResult): Promise<WeatherAlert[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 250));

    const cityLower = location.name.toLowerCase();
    const now = new Date();
    const activeFrom = new Date(now.getTime() - 2 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const activeUntil = new Date(now.getTime() + 6 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const upcomingFrom = new Date(now.getTime() + 12 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const upcomingUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const expiredUntil = new Date(now.getTime() - 4 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Location-Specific Warning Database
    if (cityLower.includes('chennai') || cityLower.includes('kanchipuram') || cityLower.includes('thiruvallur')) {
      return [
        {
          id: 'demo-alert-chennai-01',
          source: 'Demo Warning Provider',
          isDemo: true,
          location: {
            name: location.name,
            district: location.admin1 || 'Chennai District',
            state: 'Tamil Nadu',
            latitude: location.latitude,
            longitude: location.longitude
          },
          severity: 'ORANGE',
          eventType: 'HEAVY_RAIN',
          eventTypeName: 'Heavy Rainfall',
          title: 'ORANGE ALERT: Heavy to Very Heavy Rainfall Warning',
          description: 'Monsoon weather system intensifying over North Coastal Tamil Nadu. Heavy rainfall (7-11 cm) expected with gusty winds up to 45 km/h.',
          validFrom: activeFrom,
          validUntil: activeUntil,
          issuedAt: 'Today, 08:30 AM',
          recommendedAction: 'Avoid unnecessary commute in low-lying underpasses. Keep emergency backup power charged and carry waterproof gear.',
          sourceUrl: 'https://mausam.imd.gov.in',
          status: 'ACTIVE',
          whyExplanation: `You are seeing this alert because ${location.name} falls within the designated North Coastal Tamil Nadu heavy rainfall warning polygon valid between ${activeFrom} and ${activeUntil}.`
        },
        {
          id: 'demo-alert-chennai-02',
          source: 'Demo Warning Provider',
          isDemo: true,
          location: {
            name: location.name,
            district: location.admin1 || 'Chennai District',
            state: 'Tamil Nadu',
            latitude: location.latitude,
            longitude: location.longitude
          },
          severity: 'YELLOW',
          eventType: 'STRONG_WINDS',
          eventTypeName: 'Strong Winds',
          title: 'YELLOW WATCH: Coastal Wind Squall Advisory',
          description: 'Squally wind speeds reaching 35-45 km/h gusting to 55 km/h likely along Chennai & Ennore coastline.',
          validFrom: upcomingFrom,
          validUntil: upcomingUntil,
          issuedAt: 'Today, 09:00 AM',
          recommendedAction: 'Fisherfolk and small craft operators advised not to venture into deep sea waters.',
          sourceUrl: 'https://mausam.imd.gov.in',
          status: 'UPCOMING',
          whyExplanation: `You are seeing this advisory because coastal wind telemetry for ${location.name} projects squally gusts exceeding 40 km/h starting tomorrow.`
        }
      ];
    }

    if (cityLower.includes('mumbai') || cityLower.includes('thane') || cityLower.includes('palghar')) {
      return [
        {
          id: 'demo-alert-mumbai-01',
          source: 'Demo Warning Provider',
          isDemo: true,
          location: {
            name: location.name,
            district: location.admin1 || 'Mumbai Suburban',
            state: 'Maharashtra',
            latitude: location.latitude,
            longitude: location.longitude
          },
          severity: 'RED',
          eventType: 'EXTREMELY_HEAVY_RAIN',
          eventTypeName: 'Extremely Heavy Rain',
          title: 'RED WARNING: Severe Flash Flood & Downpour Threat',
          description: 'Active monsoon off-shore trough bringing extremely heavy precipitation (>20 cm in 24h) with urban waterlogging risks.',
          validFrom: activeFrom,
          validUntil: activeUntil,
          issuedAt: 'Today, 06:00 AM',
          recommendedAction: 'Restrict all non-essential movement. Avoid low-lying underpasses like Milan and Hindmata. Follow official civic disaster guidelines.',
          sourceUrl: 'https://mausam.imd.gov.in',
          status: 'ACTIVE',
          whyExplanation: `You are seeing this RED alert because ${location.name} is situated in the high-intensity coastal downpour corridor under active alert until ${activeUntil}.`
        }
      ];
    }

    if (cityLower.includes('bengaluru') || cityLower.includes('bangalore')) {
      return [
        {
          id: 'demo-alert-blr-01',
          source: 'Demo Warning Provider',
          isDemo: true,
          location: {
            name: location.name,
            district: location.admin1 || 'Bengaluru Urban',
            state: 'Karnataka',
            latitude: location.latitude,
            longitude: location.longitude
          },
          severity: 'YELLOW',
          eventType: 'THUNDERSTORM',
          eventTypeName: 'Thunderstorm & Lightning',
          title: 'YELLOW WATCH: Evening Thunderstorm & Gusty Winds',
          description: 'Moderate thunder activity with light to moderate showers and lightning expected during evening commute hours.',
          validFrom: activeFrom,
          validUntil: activeUntil,
          issuedAt: 'Today, 10:00 AM',
          recommendedAction: 'Stay updated on radar observations. Avoid taking shelter under isolated trees during sudden electrical strikes.',
          sourceUrl: 'https://mausam.imd.gov.in',
          status: 'ACTIVE',
          whyExplanation: `You are seeing this WATCH advisory because evening atmospheric instability over ${location.name} presents a thunderstorm risk between ${activeFrom} and ${activeUntil}.`
        }
      ];
    }

    if (cityLower.includes('delhi') || cityLower.includes('ncr')) {
      return [
        {
          id: 'demo-alert-delhi-01',
          source: 'Demo Warning Provider',
          isDemo: true,
          location: {
            name: location.name,
            district: location.admin1 || 'New Delhi',
            state: 'NCR',
            latitude: location.latitude,
            longitude: location.longitude
          },
          severity: 'ORANGE',
          eventType: 'HEATWAVE',
          eventTypeName: 'Heatwave Condition',
          title: 'ORANGE ALERT: Severe Heatwave & High UV Exposure',
          description: 'Maximum temperatures reaching 41-43°C with hot dry winds (Loo) across NCR plains.',
          validFrom: activeFrom,
          validUntil: activeUntil,
          issuedAt: 'Today, 07:00 AM',
          recommendedAction: 'Avoid direct sun exposure between 12:00 PM and 4:00 PM. Drink adequate water and carry hydration packs.',
          sourceUrl: 'https://mausam.imd.gov.in',
          status: 'ACTIVE',
          whyExplanation: `You are seeing this alert because ambient heat index in ${location.name} exceeds 42°C threshold under Orange severity.`
        }
      ];
    }

    if (cityLower.includes('shimla') || cityLower.includes('manali')) {
      return [
        {
          id: 'demo-alert-shimla-01',
          source: 'Demo Warning Provider',
          isDemo: true,
          location: {
            name: location.name,
            district: location.admin1 || 'Shimla District',
            state: 'Himachal Pradesh',
            latitude: location.latitude,
            longitude: location.longitude
          },
          severity: 'YELLOW',
          eventType: 'DENSE_FOG',
          eventTypeName: 'Dense Fog',
          title: 'YELLOW WATCH: Mountain Fog & Low Visibility',
          description: 'Dense fog reducing visibility below 200 meters on high-altitude passes during early morning and late evening.',
          validFrom: activeFrom,
          validUntil: activeUntil,
          issuedAt: 'Today, 05:30 AM',
          recommendedAction: 'Drive with fog lights on and maintain safe braking distance on hill roads.',
          sourceUrl: 'https://mausam.imd.gov.in',
          status: 'ACTIVE',
          whyExplanation: `You are seeing this watch notice because mountainous moisture retention in ${location.name} creates dense fog conditions.`
        }
      ];
    }

    // Default: No warning / Green state for other locations
    return [
      {
        id: `demo-alert-green-${Date.now()}`,
        source: 'Demo Warning Provider',
        isDemo: true,
        location: {
          name: location.name,
          district: location.admin1 || location.country,
          state: location.country,
          latitude: location.latitude,
          longitude: location.longitude
        },
        severity: 'GREEN',
        eventType: 'NONE',
        eventTypeName: 'No Severe Weather',
        title: 'GREEN — NO ACTIVE WARNING',
        description: 'No active severe weather warning has been detected for your selected location.',
        validFrom: 'Current Observation',
        validUntil: 'Next Update',
        issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedAction: 'No emergency action required. Continue monitoring official updates.',
        sourceUrl: 'https://mausam.imd.gov.in',
        status: 'ACTIVE',
        whyExplanation: `No meteorological warning polygon overlaps with ${location.name} coordinates at this time.`
      }
    ];
  }
}
