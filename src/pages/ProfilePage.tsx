import React, { useState } from 'react';
import { User, Shield, Bell, Globe, Save, Check } from 'lucide-react';
import { MOCK_USER_PROFILE, UserProfile } from '../data/mockWeatherData';
import { useLanguage } from '../context/LanguageContext';
import './ProfilePage.css';

export const ProfilePage: React.FC = () => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [profile, setProfile] = useState<UserProfile>(MOCK_USER_PROFILE);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="profile-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <User size={28} className="icon-cyan" /> User Profile & Risk Preferences
          </h1>
          <p className="page-subtitle">
            Customize your occupation activity profile, risk sensitivity tolerance, and emergency notification channels.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="profile-form-grid">
        {/* Personal & Role Card */}
        <div className="glass-card">
          <div className="section-header">
            <h3 className="section-title">
              <User size={20} className="icon-cyan" /> Personal Details & Role
            </h3>
          </div>

          <div className="profile-fields">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="input-field"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Primary Activity Role</label>
              <select
                className="input-field select-field"
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value as any })}
              >
                <option value="Commuter">Daily Urban Commuter</option>
                <option value="Farmer">Agricultural Farmer / Grower</option>
                <option value="Event Planner">Outdoor Event & Sports Manager</option>
                <option value="Traveler">Highway / Inter-State Traveler</option>
                <option value="Logistics Manager">Freight & Supply Chain Manager</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Primary Base City</label>
              <input
                type="text"
                className="input-field"
                value={profile.primaryCity}
                onChange={(e) => setProfile({ ...profile, primaryCity: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Risk & Notifications Card */}
        <div className="glass-card">
          <div className="section-header">
            <h3 className="section-title">
              <Shield size={20} className="icon-amber" /> Risk Sensitivity & Alerts
            </h3>
          </div>

          <div className="profile-fields">
            <div className="form-group">
              <label className="form-label">Risk Tolerance Sensitivity</label>
              <select
                className="input-field select-field"
                value={profile.riskSensitivity}
                onChange={(e) => setProfile({ ...profile, riskSensitivity: e.target.value as any })}
              >
                <option value="High">High (Alert on minor travel disruptions)</option>
                <option value="Moderate">Moderate (Standard threshold)</option>
                <option value="Low">Low (Only severe emergency warnings)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Response & Interface Language</label>
              <select
                className="input-field select-field"
                value={currentLanguage}
                onChange={(e) => setLanguage(e.target.value as any)}
              >
                <option value="en">English (Default)</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="kn">Kannada (ಕನ್ನಡ)</option>
                <option value="ml">Malayalam (മലയാളം)</option>
              </select>
            </div>

            <div className="toggle-group">
              <label className="toggle-item">
                <input
                  type="checkbox"
                  checked={profile.notificationPreferences.severeWeatherSMS}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      notificationPreferences: {
                        ...profile.notificationPreferences,
                        severeWeatherSMS: e.target.checked
                      }
                    })
                  }
                />
                <span>Receive Severe Weather SMS Alerts</span>
              </label>

              <label className="toggle-item">
                <input
                  type="checkbox"
                  checked={profile.notificationPreferences.dailyAIAdvisory}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      notificationPreferences: {
                        ...profile.notificationPreferences,
                        dailyAIAdvisory: e.target.checked
                      }
                    })
                  }
                />
                <span>Daily WeatherGPT Morning AI Advisory</span>
              </label>
            </div>
          </div>
        </div>

        <div className="profile-action-bar">
          <button type="submit" className="btn btn-primary btn-save-profile">
            {saved ? <Check size={16} /> : <Save size={16} />}
            <span>{saved ? 'Preferences Saved!' : 'Save User Profile Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
