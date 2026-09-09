import React, { useState } from 'react';
import { Sparkles, Sliders } from 'lucide-react';
import { DecisionCard } from '../components/decision/DecisionCard';
import { ChatContainer } from '../components/chat/ChatContainer';
import { LocationSearchResult } from '../services/weatherProviders/openMeteoProvider';
import './DecisionPage.css';

export const DecisionPage: React.FC = () => {
  const [activeLoc, setActiveLoc] = useState<LocationSearchResult>({
    id: 1,
    name: 'Hyderabad',
    admin1: 'Telangana',
    country: 'India',
    latitude: 17.385,
    longitude: 78.4867,
    timezone: 'Asia/Kolkata'
  });

  const handleDecisionAnalyze = (activity: string, location: LocationSearchResult, timeWindow: string) => {
    setActiveLoc(location);
  };

  return (
    <div className="decision-page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text-ai">
            <Sparkles size={28} className="icon-cyan" /> Weather Decision Engine
          </h1>
          <p className="page-subtitle">
            An evidence-grounded Interactive Activity Risk Analyzer. Configure any location, activity, date, and time window to evaluate weather risks, mathematical factor contributions, and tailored recommendations.
          </p>
        </div>
      </div>

      {/* Main Interactive Activity Risk Analyzer Component */}
      <section className="decision-main-section">
        <DecisionCard
          initialLocation={activeLoc}
          onAnalyze={handleDecisionAnalyze}
        />
      </section>

      {/* WeatherGPT Chat Assistant Integration */}
      <section className="decision-chat-section" style={{ marginTop: '2rem' }}>
        <div className="section-title-bar">
          <h2>Ask WeatherGPT Decision Questions</h2>
          <span className="badge badge-ai">Activity Q&A Integration</span>
        </div>
        <ChatContainer
          currentLocation={activeLoc}
        />
      </section>
    </div>
  );
};
