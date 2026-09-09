import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Users,
  LogOut,
  X,
  CheckCircle,
  AlertCircle,
  Trash2,
  Activity,
  Server,
  Database,
  Crown,
  Medal,
  Award
} from 'lucide-react';
import {
  AdminSession,
  AdminUser,
  AdminRole,
  getAdminUsers,
  addAdminUser,
  deleteAdminUser,
  logoutAdmin
} from '../../services/adminAuthService';
import './AdminPortal.css';

interface AdminPortalModalProps {
  session: AdminSession;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  session,
  isOpen,
  onClose,
  onLogout
}) => {
  const [adminList, setAdminList] = useState<AdminUser[]>([]);
  const [activeTab, setActiveTab] = useState<'MANAGEMENT' | 'SYSTEM'>('MANAGEMENT');

  // Form State for admitting secondary/tertiary admins
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('SECONDARY_ADMIN');

  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      refreshAdminList();
    }
  }, [isOpen]);

  const refreshAdminList = () => {
    setAdminList(getAdminUsers());
  };

  if (!isOpen) return null;

  const handleAddAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    try {
      const added = addAdminUser(
        {
          username: newUsername,
          password: newPassword,
          fullName: newFullName,
          role: newRole
        },
        session
      );

      setFormSuccess(`Successfully admitted new ${added.role === 'SECONDARY_ADMIN' ? 'Secondary' : 'Tertiary'} Admin: ${added.username}`);
      setNewUsername('');
      setNewPassword('');
      setNewFullName('');
      refreshAdminList();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to admit admin user.');
    }
  };

  const handleDeleteAdmin = (adminId: string, username: string) => {
    if (!window.confirm(`Are you sure you want to revoke admin access for "${username}"?`)) {
      return;
    }
    setFormError(null);
    setFormSuccess(null);

    try {
      deleteAdminUser(adminId, session);
      setFormSuccess(`Admin account "${username}" has been revoked.`);
      refreshAdminList();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to revoke admin user.');
    }
  };

  const handleLogoutClick = () => {
    logoutAdmin();
    onLogout();
  };

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case 'PRIMARY_ADMIN':
        return (
          <span className="role-badge badge-primary-creator">
            <Crown size={12} /> Creator (Primary)
          </span>
        );
      case 'SECONDARY_ADMIN':
        return (
          <span className="role-badge badge-secondary">
            <Medal size={12} /> Secondary Admin
          </span>
        );
      case 'TERTIARY_ADMIN':
        return (
          <span className="role-badge badge-tertiary">
            <Award size={12} /> Tertiary Admin
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-modal-backdrop">
      <div className="admin-portal-container glass-card">
        {/* Top Header */}
        <div className="admin-portal-header">
          <div className="admin-portal-title">
            <ShieldCheck size={26} className="icon-emerald" />
            <div>
              <h2>WeatherGPT Admin Dashboard</h2>
              <p className="admin-user-tag">
                Logged in as: <strong>{session.user.fullName}</strong> ({session.user.username}) —{' '}
                {getRoleBadge(session.user.role)}
              </p>
            </div>
          </div>

          <div className="header-actions-row">
            <button className="btn btn-secondary btn-sm btn-logout" onClick={handleLogoutClick}>
              <LogOut size={14} />
              <span>Logout</span>
            </button>
            <button className="btn-close-modal" onClick={onClose} aria-label="Close Portal">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs-nav">
          <button
            className={`admin-tab-btn ${activeTab === 'MANAGEMENT' ? 'active' : ''}`}
            onClick={() => setActiveTab('MANAGEMENT')}
          >
            <Users size={15} /> Admin User Management
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'SYSTEM' ? 'active' : ''}`}
            onClick={() => setActiveTab('SYSTEM')}
          >
            <Activity size={15} /> Platform Telemetry & System Health
          </button>
        </div>

        {/* TAB 1: ADMIN MANAGEMENT */}
        {activeTab === 'MANAGEMENT' && (
          <div className="admin-tab-content">
            {/* Feedback Alerts */}
            {formSuccess && (
              <div className="admin-success-toast">
                <CheckCircle size={15} /> <span>{formSuccess}</span>
              </div>
            )}
            {formError && (
              <div className="admin-error-toast">
                <AlertCircle size={15} /> <span>{formError}</span>
              </div>
            )}

            <div className="admin-management-grid">
              {/* Left Column: Registered Admins List */}
              <div className="admin-list-section glass-card">
                <h4 className="section-title">
                  <Users size={16} className="icon-cyan" /> Registered Admin Accounts ({adminList.length})
                </h4>
                <p className="section-subtitle">
                  Creator (srividya) holds super admin access and can admit or revoke secondary and tertiary admins.
                </p>

                <div className="admins-table-wrapper">
                  <table className="admins-table">
                    <thead>
                      <tr>
                        <th>Admin User</th>
                        <th>Role</th>
                        <th>Created By</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminList.map((adm) => (
                        <tr key={adm.id}>
                          <td>
                            <strong>{adm.fullName}</strong>
                            <div className="admin-username-sub">@{adm.username}</div>
                          </td>
                          <td>{getRoleBadge(adm.role)}</td>
                          <td className="created-by-cell">{adm.createdBy}</td>
                          <td>
                            {adm.role !== 'PRIMARY_ADMIN' && adm.username.toLowerCase() !== 'srividya' ? (
                              <button
                                className="btn-icon-delete"
                                onClick={() => handleDeleteAdmin(adm.id, adm.username)}
                                title="Revoke Admin Access"
                              >
                                <Trash2 size={14} />
                              </button>
                            ) : (
                              <span className="creator-lock-tag">Creator</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Admit New Secondary / Tertiary Admin Form */}
              <div className="admit-admin-form-section glass-card">
                <h4 className="section-title">
                  <UserPlus size={16} className="icon-emerald" /> Admit New Admin
                </h4>
                <p className="section-subtitle">
                  Grant access to secondary managers or tertiary operators.
                </p>

                <form onSubmit={handleAddAdminSubmit} className="admit-admin-form">
                  <div className="form-group">
                    <label className="form-label">Full Name:</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. John Doe (Secondary)"
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Username:</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. manager1"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password:</label>
                    <input
                      type="password"
                      className="input-field"
                      placeholder="Assign password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assign Role Level:</label>
                    <select
                      className="input-field select-field"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as AdminRole)}
                    >
                      <option value="SECONDARY_ADMIN">🥈 Secondary Admin (Manager / Analyst)</option>
                      <option value="TERTIARY_ADMIN">🥉 Tertiary Admin (Operator / Monitor)</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary btn-admit">
                    <UserPlus size={15} />
                    <span>Admit Admin User</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SYSTEM TELEMETRY */}
        {activeTab === 'SYSTEM' && (
          <div className="admin-tab-content">
            <div className="system-telemetry-grid">
              <div className="telemetry-card glass-card">
                <Server size={20} className="icon-cyan" />
                <h4>Open-Meteo Weather API</h4>
                <span className="status-pill status-healthy">Operational</span>
                <p>Telemetry sync frequency: Real-time (0.3s grid latency)</p>
              </div>

              <div className="telemetry-card glass-card">
                <Activity size={20} className="icon-emerald" />
                <h4>IMD Alert Network Feed</h4>
                <span className="status-pill status-healthy">Active</span>
                <p>National Meteorological Warning Feed operational</p>
              </div>

              <div className="telemetry-card glass-card">
                <Database size={20} className="icon-violet" />
                <h4>Risk Engine Status</h4>
                <span className="status-pill status-healthy">Deterministic 100%</span>
                <p>16 Activity sensitivity profiles loaded & active</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
