import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import './TimeSelector.css';

interface TimeSelectorProps {
  selectedTimeInput: string;
  onSelectTime: (timeInput: string) => void;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({
  selectedTimeInput,
  onSelectTime
}) => {
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customTimeVal, setCustomTimeVal] = useState('');

  const timeOptions = [
    { label: 'Morning', hours: '6 AM – 12 PM', icon: '🌅' },
    { label: 'Afternoon', hours: '12 PM – 5 PM', icon: '☀️' },
    { label: 'Evening', hours: '5 PM – 10 PM', icon: '🌆' },
    { label: 'Night', hours: '10 PM – 6 AM', icon: '🌙' }
  ];

  const handleCustomChange = (val: string) => {
    setCustomTimeVal(val);
    if (val) {
      onSelectTime(val);
    }
  };

  return (
    <div className="time-selector-container">
      <label className="selector-title-label">
        3. Select Target Time Period
      </label>

      <div className="time-grid">
        {timeOptions.map((opt) => {
          const isSelected = !isCustomTime && selectedTimeInput.toLowerCase().includes(opt.label.toLowerCase());
          return (
            <button
              key={opt.label}
              type="button"
              className={`time-card glass-card ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                setIsCustomTime(false);
                onSelectTime(opt.label);
              }}
            >
              <span className="time-icon">{opt.icon}</span>
              <div className="time-info">
                <span className="time-label">{opt.label}</span>
                <span className="time-hours">{opt.hours}</span>
              </div>
            </button>
          );
        })}

        {/* Custom Time Option */}
        <button
          type="button"
          className={`time-card glass-card ${isCustomTime ? 'selected' : ''}`}
          onClick={() => setIsCustomTime(true)}
        >
          <span className="time-icon">🕒</span>
          <div className="time-info">
            <span className="time-label">Custom Time</span>
            <span className="time-hours">Exact Hour</span>
          </div>
        </button>
      </div>

      {isCustomTime && (
        <div className="custom-time-picker-box glass-card">
          <div className="time-picker-row">
            <Clock size={15} className="icon-cyan" />
            <input
              type="time"
              className="input-field time-picker-input"
              value={customTimeVal}
              onChange={(e) => handleCustomChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
