import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Key, X, AlertCircle, Sparkles, CheckCircle } from 'lucide-react';
import { authenticateAdmin, AdminSession } from '../../services/adminAuthService';
import './AdminPortal.css';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: AdminSession) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const session = authenticateAdmin(username, password);
      setIsSubmitting(false);
      onLoginSuccess(session);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'Authentication failed.');
    }
  };

  const handlePrefillCreator = () => {
    setUsername('srividya');
    setPassword('12345*');
    setErrorMsg(null);
  };

  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal-container glass-card">
        {/* Header */}
        <div className="admin-modal-header">
          <div className="admin-header-title">
            <ShieldCheck size={24} className="icon-emerald" />
            <div>
              <h3>Admin Access Portal</h3>
              <p className="admin-subtitle">Authenticate to access platform administration & management</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose} aria-label="Close Modal">
            <X size={18} />
          </button>
        </div>

        {/* Creator Quick Fill Hint */}
        <div className="creator-quick-fill-box" onClick={handlePrefillCreator}>
          <Sparkles size={16} className="icon-amber" />
          <div className="quick-fill-text">
            <span><strong>Creator Credentials (Click to pre-fill):</strong></span>
            <code>Username: srividya | Password: 12345*</code>
          </div>
        </div>

        {errorMsg && (
          <div className="admin-error-toast">
            <AlertCircle size={15} /> <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="admin-login-form">
          <div className="form-group">
            <label className="form-label">
              <User size={14} className="icon-cyan" /> Username
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter username (e.g. srividya)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Key size={14} className="icon-violet" /> Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter password (e.g. 12345*)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="admin-actions-bar">
            <button
              type="submit"
              className="btn btn-primary btn-admin-submit"
              disabled={isSubmitting}
            >
              <Lock size={15} />
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In as Admin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
