import React from 'react';
import {
  Sparkles,
  Compass,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { AIRecommendation } from '../../data/mockWeatherData';
import './RecommendationCard.css';

interface RecommendationCardProps {
  recommendation: AIRecommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  return (
    <div className="recommendation-card glass-card">
      {/* AI Header Badge */}
      <div className="section-header">
        <h3 className="section-title gradient-text-ai">
          <Sparkles size={22} className="icon-ai-spark" /> WeatherGPT AI Decision Advisory
        </h3>
        <div className="confidence-chip">
          <span>AI Confidence: <strong>{recommendation.confidenceScore}%</strong></span>
        </div>
      </div>

      {/* Query Context if present */}
      {recommendation.queryContext && (
        <div className="query-context-banner">
          <Compass size={16} className="icon-cyan" />
          <span>Analyzed Context: <strong>"{recommendation.queryContext}"</strong></span>
        </div>
      )}

      {/* Core Summary (Decision sentence) */}
      <div className="ai-summary-box">
        <p className="summary-headline">"{recommendation.summary}"</p>
      </div>

      {/* Primary Travel & Action Advisory */}
      <div className="advisory-highlight-box">
        <Clock size={20} className="icon-amber" />
        <div>
          <h4 className="advisory-title">Recommended Timing & Protocol</h4>
          <p className="advisory-text">{recommendation.travelAdvisory}</p>
          {recommendation.alternativeTiming && (
            <span className="alt-time-tag">{recommendation.alternativeTiming}</span>
          )}
        </div>
      </div>

      {/* Actionable Columns: Carry Items & Safety Precautions */}
      <div className="recommendation-columns">
        {/* Carry Items Checklist */}
        <div className="rec-column">
          <h5 className="rec-col-title">
            <Briefcase size={16} className="icon-cyan" /> Essential Equipment & Gear
          </h5>
          <ul className="rec-list">
            {recommendation.carryItems.map((item, idx) => (
              <li key={idx} className="rec-list-item">
                <CheckCircle2 size={16} className="icon-emerald" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Safety Precautions */}
        <div className="rec-column">
          <h5 className="rec-col-title">
            <ShieldAlert size={16} className="icon-rose" /> Route & Ground Precautions
          </h5>
          <ul className="rec-list">
            {recommendation.safetyPrecautions.map((tip, idx) => (
              <li key={idx} className="rec-list-item">
                <AlertCircle size={16} className="icon-amber" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
