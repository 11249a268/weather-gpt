import React, { useState } from 'react';
import { ACTIVITIES_CONFIG, ActivityId } from '../../config/activityConfig';
import { Edit3 } from 'lucide-react';
import './ActivitySelector.css';

interface ActivitySelectorProps {
  selectedActivityId: ActivityId;
  customText: string;
  onSelectActivity: (id: ActivityId) => void;
  onChangeCustomText: (text: string) => void;
}

export const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  selectedActivityId,
  customText,
  onSelectActivity,
  onChangeCustomText
}) => {
  const activities = Object.values(ACTIVITIES_CONFIG);

  return (
    <div className="activity-selector-container">
      <label className="selector-title-label">
        1. Select Planned Activity
      </label>

      <div className="activities-grid">
        {activities.map((act) => {
          const isSelected = selectedActivityId === act.id;
          return (
            <button
              key={act.id}
              type="button"
              className={`activity-card glass-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectActivity(act.id)}
            >
              <span className="activity-icon">{act.icon}</span>
              <div className="activity-info">
                <span className="activity-name">{act.name}</span>
                <span className="activity-desc">{act.description}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Requirement 3: Custom Activity Input */}
      {selectedActivityId === 'custom' && (
        <div className="custom-activity-input-box glass-card">
          <div className="custom-input-label">
            <Edit3 size={15} className="icon-cyan" />
            <span>Describe your custom activity:</span>
          </div>
          <input
            type="text"
            className="input-field custom-text-input"
            placeholder="e.g. College cultural fest, morning trail run..."
            value={customText}
            onChange={(e) => onChangeCustomText(e.target.value)}
          />
          <span className="custom-hint-text">
            WeatherGPT will classify your activity into nearest risk profile or run a general outdoor assessment.
          </span>
        </div>
      )}
    </div>
  );
};
