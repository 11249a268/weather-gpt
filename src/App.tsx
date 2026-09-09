import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { WeatherPage } from './pages/WeatherPage';
import { DecisionPage } from './pages/DecisionPage';
import { AlertsPage } from './pages/AlertsPage';
import { ClimatePage } from './pages/ClimatePage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ShieldAlert } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <Router>
        <div className="app-container">
          {/* Background Ambient Glow FX */}
          <div className="bg-glow-container">
            <div className="bg-glow-1"></div>
            <div className="bg-glow-2"></div>
          </div>

          {/* Live Weather Intelligence Banner */}
          <div className="demo-banner">
            <ShieldAlert size={14} />
            <span>WeatherGPT • Dynamic Weather Intelligence Platform</span>
          </div>

          {/* Top Navbar */}
          <Navbar />

          {/* Page Content */}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/decision" element={<DecisionPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/climate" element={<ClimatePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </Router>
    </LanguageProvider>
  );
};

export default App;
