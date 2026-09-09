import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';

import { StructuredAIResponse } from '../../services/aiService';
import { WeatherGPTResponse } from '../../services/explanationService';
import { StructuredResponseCard } from './StructuredResponseCard';
import { ClimateChatInsight } from './ClimateChatInsight';
import { FollowUpPills } from './FollowUpPills';

import { useLanguage } from '../../context/LanguageContext';
import { translateExplanationText } from '../../services/translationService';

import './ChatMessage.css';

export interface MessageItem {
  id: string;
  sender: 'user' | 'bot';
  text?: string;
  structuredResponse?: StructuredAIResponse;
  weatherGPTResponse?: WeatherGPTResponse;
  timestamp: string;
  followUpSuggestions?: string[];
}

interface ChatMessageProps {
  message: MessageItem;
  onSelectFollowUp: (question: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSelectFollowUp,
}) => {
  const { selectedLanguage } = useLanguage();

  const [translatedText, setTranslatedText] = useState(message.text || '');
  const [isTranslating, setIsTranslating] = useState(false);

  /*
   * IMPORTANT:
   * Whenever the user changes the selected language,
   * translate the EXISTING message again.
   *
   * This means:
   *
   * English message
   *      ↓ select Hindi
   * Hindi transcript appears
   *      ↓ select Tamil
   * Tamil transcript appears
   *      ↓ select Telugu
   * Telugu transcript appears
   */

  useEffect(() => {
    let cancelled = false;

    const translateCurrentMessage = async () => {
      if (message.sender !== 'bot') {
        return;
      }

      const originalText =
        message.weatherGPTResponse?.explanationText ||
        message.text ||
        '';

      if (!originalText) {
        setTranslatedText('');
        return;
      }

      // English = show original text
      if (selectedLanguage === 'en') {
        setTranslatedText(originalText);
        return;
      }

      setIsTranslating(true);

      try {
        const translated = await translateExplanationText(
          originalText,
          selectedLanguage
        );

        if (!cancelled) {
          setTranslatedText(translated);
        }
      } catch (error) {
        console.error(
          'Failed to translate existing chat message:',
          error
        );

        if (!cancelled) {
          setTranslatedText(originalText);
        }
      } finally {
        if (!cancelled) {
          setIsTranslating(false);
        }
      }
    };

    translateCurrentMessage();

    return () => {
      cancelled = true;
    };
  }, [
    message.id,
    message.sender,
    message.text,
    message.weatherGPTResponse?.explanationText,
    selectedLanguage,
  ]);

  if (message.sender === 'user') {
    return (
      <div className="chat-message-row message-user-row">
        <div className="user-message-bubble">
          <p className="user-message-text">{message.text}</p>

          <span className="user-message-time">
            {message.timestamp}
          </span>
        </div>

        <div className="user-avatar">
          <User size={16} />
        </div>
      </div>
    );
  }

  /*
   * Climate response
   */
  if (message.weatherGPTResponse?.climateResult) {
    return (
      <div className="chat-message-row message-bot-row">
        <div
          className="climate-bot-bubble-wrapper"
          style={{ width: '100%' }}
        >
          <ClimateChatInsight
            result={message.weatherGPTResponse.climateResult}
          />

          <div
            className="bot-explanation-text-bubble glass-card"
            style={{
              padding: '1rem',
              marginTop: '0.5rem',
              borderRadius: '12px',
              fontSize: '0.92rem',
              lineHeight: '1.5',
              color: '#f1f5f9',
            }}
          >
            <p
              style={{
                margin: 0,
                whiteSpace: 'pre-line',
              }}
            >
              {isTranslating ? 'Translating...' : translatedText}
            </p>
          </div>

          {message.followUpSuggestions &&
            message.followUpSuggestions.length > 0 && (
              <FollowUpPills
                suggestions={message.followUpSuggestions}
                onSelectFollowUp={onSelectFollowUp}
              />
            )}
        </div>
      </div>
    );
  }

  /*
   * Structured response
   *
   * Keep the structured card unchanged for now.
   * We are fixing the transcript/explanation first.
   */
  if (message.structuredResponse) {
    return (
      <div className="chat-message-row message-bot-row">
        <StructuredResponseCard
          response={message.structuredResponse}
          onSelectFollowUp={onSelectFollowUp}
        />
      </div>
    );
  }

  /*
   * Normal bot response
   */
  return (
    <div className="chat-message-row message-bot-row">
      <div
        className="bot-fallback-bubble glass-card"
        style={{
          padding: '1rem',
          borderRadius: '14px',
        }}
      >
        <p
          style={{
            margin: 0,
            whiteSpace: 'pre-line',
          }}
        >
          {isTranslating ? 'Translating...' : translatedText}
        </p>

        {message.followUpSuggestions &&
          message.followUpSuggestions.length > 0 && (
            <FollowUpPills
              suggestions={message.followUpSuggestions}
              onSelectFollowUp={onSelectFollowUp}
            />
          )}
      </div>
    </div>
  );
};
