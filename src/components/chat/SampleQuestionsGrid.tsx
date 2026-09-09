import React from 'react';
import { Sparkles, Compass, Sun, Umbrella, Activity, Sprout, Clock, ShieldAlert, BarChart3, Globe } from 'lucide-react';
import './SampleQuestionsGrid.css';

interface SampleQuestionsGridProps {
  onSelectQuestion: (question: string) => void;
}

export const SampleQuestionsGrid: React.FC<SampleQuestionsGridProps> = ({ onSelectQuestion }) => {
  const SAMPLES = [
    {
      text: 'Will it rain today?',
      icon: <Umbrella size={18} className="icon-cyan" />,
      tag: '🌧️ Rain Forecast'
    },
    {
      text: 'Can I travel tomorrow?',
      icon: <Compass size={18} className="icon-cyan" />,
      tag: '🚗 Travel Advisory'
    },
    {
      text: 'Can I play cricket tomorrow evening?',
      icon: <Activity size={18} className="icon-violet" />,
      tag: '🏏 Sports & Outdoor'
    },
    {
      text: 'Are there any weather warnings?',
      icon: <ShieldAlert size={18} className="icon-amber" />,
      tag: '⚠️ Weather Alerts'
    },
    {
      text: 'What is the safest time tomorrow?',
      icon: <Clock size={18} className="icon-teal" />,
      tag: '🕐 Time Window'
    },
    {
      text: 'Was this month hotter than usual?',
      icon: <BarChart3 size={18} className="icon-emerald" />,
      tag: '📊 Climate Intelligence'
    },
    {
      text: 'రేపు సాయంత్రం క్రికెట్ ఆడవచ్చా?',
      icon: <Globe size={18} className="icon-amber" />,
      tag: 'Telugu (తెలుగు)'
    },
    {
      text: 'क्या मैं कल बाहर जा सकता हूँ?',
      icon: <Globe size={18} className="icon-violet" />,
      tag: 'Hindi (हिन्दी)'
    },
    {
      text: 'நாளை மழை பெய்யுமா?',
      icon: <Globe size={18} className="icon-cyan" />,
      tag: 'Tamil (தமிழ்)'
    }
  ];

  return (
    <div className="empty-state-wrapper glass-card">
      <div className="empty-state-header">
        <div className="empty-icon-box">
          <Sparkles size={28} className="icon-cyan" />
        </div>
        <h3 className="empty-title">How can WeatherGPT help you today?</h3>
        <p className="empty-subtitle">
          Ask WeatherGPT in English or Indian languages (Telugu, Tamil, Hindi, Kannada, Malayalam, Tanglish/Hinglish).
        </p>
      </div>

      <div className="sample-grid">
        {SAMPLES.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            className="sample-card glass-card-interactive"
            onClick={() => onSelectQuestion(sample.text)}
          >
            <div className="sample-card-top">
              {sample.icon}
              <span className="sample-tag">{sample.tag}</span>
            </div>
            <p className="sample-text">"{sample.text}"</p>
          </button>
        ))}
      </div>
    </div>
  );
};
