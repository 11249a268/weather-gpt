import React, { useState, useRef, useEffect } from 'react';
import { Bot, Mic, Send, Sparkles, RefreshCw, AlertCircle, MapPin, CheckCircle, Trash2, Database } from 'lucide-react';
import { processWeatherQuery } from '../../services/weatherPipelineService';
import { fetchWeatherForLocation, getActiveWeatherContext } from '../../services/weatherService';
import { clearConversationState } from '../../services/conversationContextService';
import { ChatMessage, MessageItem } from './ChatMessage';
import { SampleQuestionsGrid } from './SampleQuestionsGrid';
import { DebugPanel } from './DebugPanel';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState } from '../ui/ErrorState';
import { LocationSearchResult } from '../../services/weatherProviders/openMeteoProvider';
import { WeatherGPTResponse } from '../../services/explanationService';
import { useLanguage } from '../../context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../../config/languageConfig';
import { VoiceInputButton, VoiceSpeakerButton } from './VoiceControls';
import { DataSourcesModal } from '../common/DataSourcesModal';
import './ChatContainer.css';

import { MultilingualVoiceBar } from './MultilingualVoiceBar';
import { textToSpeechService } from '../../services/textToSpeechService';

interface ChatContainerProps {
  currentLocation?: LocationSearchResult;
  onRefreshWeather?: () => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  currentLocation,
  onRefreshWeather
}) => {
  const { currentLanguage, autoSpeak, voiceGender, t } = useLanguage();
  const activeLangConfig = SUPPORTED_LANGUAGES[currentLanguage];

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);
  const [showDataSources, setShowDataSources] = useState(false);

  // Active Location State
  const [activeLoc, setActiveLoc] = useState<LocationSearchResult>(() => {
    if (currentLocation) return currentLocation;
    const activeCtx = getActiveWeatherContext();
    if (activeCtx) return activeCtx.location;
    return {
      id: 1,
      name: 'Chennai',
      admin1: 'Tamil Nadu',
      country: 'India',
      latitude: 13.0827,
      longitude: 80.2707,
      timezone: 'Asia/Kolkata'
    };
  });

  useEffect(() => {
    if (currentLocation) {
      setActiveLoc(currentLocation);
    }
  }, [currentLocation]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = textToSend || inputQuery;
    if (!queryText || !queryText.trim() || loading) return;

    const userText = queryText.trim();
    setInputQuery('');
    setError(null);
    setRefreshNotice(null);

    const userMsg: MessageItem = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const pipelineRes: WeatherGPTResponse = await processWeatherQuery(userText, activeLoc, currentLanguage);

      const botMsg: MessageItem = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: pipelineRes.explanationText,
        weatherGPTResponse: pipelineRes,
        structuredResponse: undefined,
        followUpSuggestions: pipelineRes.followUpSuggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);

      // Auto-Speak if enabled (Requirement: Default OFF, auto-speaks when ON)
      if (autoSpeak && pipelineRes.explanationText) {
        textToSpeechService.speak(
  pipelineRes.explanationText,
  currentLanguage,
  voiceGender
);
      }
    } catch (err: any) {
      console.error('Failed to process weather query:', err);
      setError(err.message || 'An unexpected error occurred while contacting WeatherGPT.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshClick = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchWeatherForLocation(activeLoc);
      if (onRefreshWeather) onRefreshWeather();
      setRefreshNotice(`Weather telemetry refetched for ${activeLoc.name}`);
      setTimeout(() => setRefreshNotice(null), 3500);
    } catch (err: any) {
      setError('Failed to refetch live weather data.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    setInputQuery('');
    setError(null);
  };

  return (
    <div className="chat-container-card glass-card">
      <div className="chat-main-header">
        <div className="header-left-group">
          <div className="header-bot-badge">
            <Bot size={22} className="icon-cyan" />
            <Sparkles size={12} className="header-sparkle" />
          </div>
          <div>
            <h2 className="header-main-title">Ask WeatherGPT</h2>
            <p className="header-main-subtitle">
              Weather-Aware AI Decision Assistant • Empirical Open-Meteo Analysis
            </p>
          </div>
        </div>

        <div className="header-actions-group" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="lang-indicator-pill">
            🌐 Language: {activeLangConfig.nativeName} ({activeLangConfig.displayName})
          </span>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowDataSources(true)}
            title="View Data Sources & Transparency"
          >
            <Database size={13} />
            <span>Sources</span>
          </button>

          {messages.length > 0 && (
            <button className="btn btn-secondary btn-clear-session" onClick={handleClearHistory} title="Clear current chat session">
              <RefreshCw size={14} />
              <span>{t('newSession', 'New Session')}</span>
            </button>
          )}
        </div>
      </div>

      <div className="live-weather-context-bar">
        <div className="location-indicator">
          <MapPin size={15} className="icon-cyan" />
          <span>
            {getActiveWeatherContext()?.isCached
              ? `Showing recently cached weather data for: 📍 ${activeLoc.name}${activeLoc.admin1 ? `, ${activeLoc.admin1}` : ''}`
              : `Using live weather data for: 📍 ${activeLoc.name}${activeLoc.admin1 ? `, ${activeLoc.admin1}` : ''}`}
          </span>
        </div>

        <button
          type="button"
          className="btn-refresh-weather"
          onClick={handleRefreshClick}
          disabled={loading}
          title="Refetch latest telemetry from Open-Meteo"
        >
          <RefreshCw size={13} className={loading ? 'spinning' : ''} />
          <span>{t('refreshWeather', 'Refresh Weather')}</span>
        </button>
      </div>

      {/* Multilingual AI Voice Controls Bar */}
      <MultilingualVoiceBar lastResponseText={[...messages].reverse().find((m) => m.sender === 'bot')?.text} />

      {refreshNotice && (
        <div className="refresh-notice-banner">
          <CheckCircle size={14} />
          <span>{refreshNotice}</span>
        </div>
      )}

      <div className="chat-feed-area">
        {messages.length === 0 ? (
          <SampleQuestionsGrid onSelectQuestion={(q) => handleSendMessage(q)} />
        ) : (
          messages.map((msg) => (
            <React.Fragment key={msg.id}>
              <div className="chat-msg-row-wrapper">
                <ChatMessage
                  message={msg}
                  onSelectFollowUp={(q) => handleSendMessage(q)}
                />
                {msg.sender === 'bot' && (
                  <div className="msg-tts-action-row" style={{ marginLeft: '3rem', marginTop: '0.3rem' }}>
                    <VoiceSpeakerButton textToRead={msg.text || ''} />
                  </div>
                )}
              </div>

              {msg.sender === 'bot' && msg.structuredResponse?.debugInfo && (
                <DebugPanel debugInfo={msg.structuredResponse.debugInfo} />
              )}
            </React.Fragment>
          ))
        )}

        {loading && (
          <div className="chat-loading-row">
            <LoadingState message={`WeatherGPT is checking the latest weather for ${activeLoc.name}...`} />
          </div>
        )}

        {error && (
          <div className="chat-error-row">
            <ErrorState
              title="Assistant Error"
              message={error}
              onRetry={() => handleSendMessage()}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-footer">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="chat-console-form"
        >
          <div className="console-input-with-actions">
            <input
              ref={inputRef}
              type="text"
              className="input-field console-field"
              placeholder={`Ask WeatherGPT in ${activeLangConfig.nativeName} or English...`}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={loading}
            />

            <div className="console-buttons-row">
              <VoiceInputButton
                onTranscriptConfirmed={(text) => handleSendMessage(text)}
                disabled={loading}
              />

              <button
                type="submit"
                className="btn btn-primary btn-console-send"
                disabled={loading || !inputQuery.trim()}
              >
                <Send size={16} />
                <span className="btn-send-label">Send</span>
              </button>
            </div>
          </div>
        </form>

        <div className="voice-coming-soon-banner">
          <AlertCircle size={12} className="icon-cyan" />
          <span>Multilingual Voice STT/TTS Active • Open-Meteo &amp; IMD Telemetry Grounded</span>
        </div>
      </div>

      <DataSourcesModal isOpen={showDataSources} onClose={() => setShowDataSources(false)} />
    </div>
  );
};
