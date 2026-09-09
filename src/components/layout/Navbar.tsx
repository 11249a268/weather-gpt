import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CloudSun,
  ShieldAlert,
  BarChart3,
  Compass,
  User,
  Menu,
  X,
  MessageSquare,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../ui/LanguageSelector';
import { AdminLoginModal } from '../admin/AdminLoginModal';
import { AdminPortalModal } from '../admin/AdminPortalModal';
import { getCurrentAdminSession, AdminSession } from '../../services/adminAuthService';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [portalModalOpen, setPortalModalOpen] = useState(false);

  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    setAdminSession(getCurrentAdminSession());
  }, []);

  const handleAskWeatherGPT = () => {
    navigate('/#weathergpt-chat-container');
    const el = document.getElementById('weathergpt-chat-container');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleAdminBtnClick = () => {
    if (adminSession) {
      setPortalModalOpen(true);
    } else {
      setLoginModalOpen(true);
    }
    setMobileMenuOpen(false);
  };

  const handleLoginSuccess = (session: AdminSession) => {
    setAdminSession(session);
    setLoginModalOpen(false);
    setPortalModalOpen(true);
  };

  const handleLogout = () => {
    setAdminSession(null);
    setPortalModalOpen(false);
  };

  return (
    <header className="navbar-wrapper">
      <div className="navbar-container">
        {/* Brand Logo */}
        <NavLink to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon-box">
            <CloudSun className="brand-weather-icon" size={24} />
            <Sparkles className="brand-ai-spark" size={14} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Weather<span className="brand-accent">GPT</span></span>
            <span className="brand-tagline">{t('tagline', 'AI Decision Assistant')}</span>
          </div>
        </NavLink>

        {/* Desktop Navigation Links */}
        <nav className="navbar-links-desktop">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {t('navHome', 'Home')}
          </NavLink>
          <NavLink to="/weather" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {t('navWeather', 'Weather')}
          </NavLink>
          <button type="button" className="nav-item nav-btn-link" onClick={handleAskWeatherGPT}>
            WeatherGPT
          </button>
          <NavLink to="/alerts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {t('navAlerts', 'Alerts')}
          </NavLink>
          <NavLink to="/decision" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {t('navDecision', 'Decision Assistant')}
          </NavLink>
          <NavLink to="/climate" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            📊 {t('navClimate', 'Climate')}
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {t('navSettings', 'Settings')}
          </NavLink>
          {adminSession && (
            <NavLink to="/admin" className={({ isActive }) => `nav-item nav-admin-item ${isActive ? 'active' : ''}`}>
              🛡️ Admin Dashboard
            </NavLink>
          )}
        </nav>

        {/* Action Buttons, Language Selector & Mobile Toggle */}
        <div className="navbar-actions">
          <LanguageSelector />

          {/* Admin Login / Admin Dashboard Button */}
          <button
            type="button"
            className={`btn ${adminSession ? 'btn-secondary btn-admin-badge' : 'btn-secondary btn-admin-login'}`}
            onClick={handleAdminBtnClick}
            title={adminSession ? `Logged in as ${adminSession.user.fullName}` : 'Admin Login'}
          >
            {adminSession ? (
              <>
                <Crown size={15} className="icon-amber" />
                <span>👑 Admin ({adminSession.user.username})</span>
              </>
            ) : (
              <>
                <ShieldCheck size={15} className="icon-emerald" />
                <span>Admin Login</span>
              </>
            )}
          </button>

          <button className="btn btn-ai btn-ask-weathergpt" onClick={handleAskWeatherGPT}>
            <MessageSquare size={16} />
            <span>Ask WeatherGPT</span>
          </button>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <nav className="mobile-nav-links">
            <NavLink to="/" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>
              <Compass size={18} /> Home
            </NavLink>
            <NavLink to="/weather" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>
              <CloudSun size={18} /> Weather
            </NavLink>
            <button type="button" className="mobile-nav-item nav-btn-link" onClick={handleAskWeatherGPT}>
              <Sparkles size={18} /> WeatherGPT
            </button>
            <NavLink to="/alerts" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>
              <ShieldAlert size={18} /> Weather Alerts
            </NavLink>
            <NavLink to="/decision" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>
              <Sparkles size={18} /> Decision Assistant
            </NavLink>
            <NavLink to="/climate" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>
              <BarChart3 size={18} /> 📊 Climate
            </NavLink>
            <NavLink to="/profile" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>
              <User size={18} /> Settings
            </NavLink>
            <button type="button" className="mobile-nav-item nav-btn-link" onClick={handleAdminBtnClick}>
              <ShieldCheck size={18} className="icon-emerald" /> {adminSession ? `Admin (${adminSession.user.username})` : 'Admin Login'}
            </button>
          </nav>
        </div>
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Admin Portal Modal */}
      {adminSession && (
        <AdminPortalModal
          session={adminSession}
          isOpen={portalModalOpen}
          onClose={() => setPortalModalOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </header>
  );
};
