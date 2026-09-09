import React, { useState } from 'react';
import { Sparkles, Mic, Send, Bot, MessageSquare } from 'lucide-react';
import './ChatInput.css';

interface ChatInputProps {
  onSendMessage: (query: string) => void;
  onVoiceTrigger?: () => void;
  isLoading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onVoiceTrigger, isLoading = false }) => {
  const [query, setQuery] = useState('');

  const PRESET_QUERIES = [
    'Should I travel from Mumbai to Pune today?',
    'Is it safe for outdoor farming in Nashik tomorrow?',
    'Will heavy rain impact evening flights out of Delhi?',
    'Suggest rain gear for 4 PM commute in Bengaluru.'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSendMessage(query.trim());
    }
  };

  const handleSelectPreset = (presetText: string) => {
    setQuery(presetText);
    onSendMessage(presetText);
  };

  return (
    <div className="chat-input-wrapper glass-card">
      <div className="chat-header">
        <div className="chat-title">
          <Bot size={20} className="icon-cyan" />
          <span>Ask WeatherGPT AI Reasoning Assistant</span>
        </div>
        <span className="badge badge-ai">Natural Language Interface</span>
      </div>

      <form onSubmit={handleSubmit} className="chat-form">
        <div className="input-with-actions">
          <input
            type="text"
            className="input-field chat-field"
            placeholder="Ask anything... e.g. 'Is it safe to travel to Lonavala by car at 5 PM?'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />

          <div className="mobile-action-row">
            <button
              type="button"
              className="btn-mic"
              onClick={onVoiceTrigger}
              title="// VOICE API INTEGRATION POINT - Click to test voice prompt simulation"
              aria-label="Voice input prompt"
            >
              <Mic size={18} />
            </button>

            <button type="submit" className="btn btn-primary btn-send" disabled={isLoading || !query.trim()}>
              <Send size={16} />
              <span className="btn-send-text">Ask</span>
            </button>
          </div>
        </div>
      </form>

      {/* Preset Query Recommendation Pills */}
      <div className="presets-container">
        <span className="preset-label">Sample AI Prompts:</span>
        <div className="preset-pills">
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              className="preset-pill"
              onClick={() => handleSelectPreset(preset)}
            >
              <MessageSquare size={12} className="icon-cyan" />
              <span>{preset}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
