import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  BarChart3,
  Activity,
  Globe,
  Server,
  Lock,
  Crown,
  Medal,
  Award,
  LogOut,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  FileText,
  UserPlus,
  Trash2
} from 'lucide-react';
import {
  getCurrentAdminSession,
  logoutAdmin,
  AdminSession,
  AdminRole,
  addAdminUser,
  deleteAdminUser
} from '../services/adminAuthService';
import {
  getAdminOverviewStats,
  getAdminUsersList,
  updateUserRoleByAdmin,
  getAdminActivityRiskAnalytics,
  getAdminMultilingualAnalytics,
  getAdminSystemHealth,
  getAdminAuditLogs,
  AdminOverviewStats
} from '../services/adminApiService';
import { AdminLoginModal } from '../components/admin/AdminLoginModal';
import './AdminDashboardPage.css';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'ANALYTICS' | 'SYSTEM' | 'AUDIT'>('OVERVIEW');

  // Data States
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [riskAnalytics, setRiskAnalytics] = useState<any>(null);
  const [multilingualAnalytics, setMultilingualAnalytics] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // UI Toast States
  const [loading, setLoading] = useState(true);
  const [forbiddenError, setForbiddenError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form State for Adding New Admins
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('SECONDARY_ADMIN');

  useEffect(() => {
    const active = getCurrentAdminSession();
    setSession(active);

    if (active) {
      loadDashboardData(active.token);
    } else {
      setLoading(false);
    }
  }, []);

  const loadDashboardData = async (token: string) => {
    setLoading(true);
    setForbiddenError(null);

    try {
      const [ovStats, uList, rAnalytics, mLang, sysHealth, aLogs] = await Promise.all([
        getAdminOverviewStats(token),
        getAdminUsersList(token),
        getAdminActivityRiskAnalytics(token),
        getAdminMultilingualAnalytics(token),
        getAdminSystemHealth(token),
        getAdminAuditLogs(token)
      ]);

      setStats(ovStats);
      setUsersList(uList);
      setRiskAnalytics(rAnalytics);
      setMultilingualAnalytics(mLang);
      setSystemHealth(sysHealth);
      setAuditLogs(aLogs);
    } catch (err: any) {
      console.error('Admin API Authorization Error:', err);
      setForbiddenError(err?.message || '403: Forbidden. You do not have permission to access the admin API.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: AdminRole) => {
    if (!session) return;
    setActionSuccess(null);
    setForbiddenError(null);

    try {
      const updated = await updateUserRoleByAdmin(targetUserId, newRole, session.token);
      setActionSuccess(`Updated role for @${updated.username} to ${newRole}`);
      loadDashboardData(session.token);
    } catch (err: any) {
      setForbiddenError(err?.message || 'Failed to update user role.');
    }
  };

  const handleAddAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setActionSuccess(null);
    setForbiddenError(null);

    try {
      const added = addAdminUser(
        { username: newUsername, password: newPassword, fullName: newFullName, role: newRole },
        session
      );
      setActionSuccess(`Successfully admitted new admin: @${added.username}`);
      setNewUsername('');
      setNewPassword('');
      setNewFullName('');
      loadDashboardData(session.token);
    } catch (err: any) {
      setForbiddenError(err?.message || 'Failed to admit admin user.');
    }
  };

  const handleDeleteAdmin = (adminId: string, username: string) => {
    if (!session) return;
    if (!window.confirm(`Are you sure you want to revoke admin access for @${username}?`)) return;

    setActionSuccess(null);
    setForbiddenError(null);

    try {
      deleteAdminUser(adminId, session);
      setActionSuccess(`Admin user @${username} has been revoked.`);
      loadDashboardData(session.token);
    } catch (err: any) {
      setForbiddenError(err?.message || 'Failed to revoke admin account.');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setSession(null);
    navigate('/');
  };

  // FORBIDDEN / UNAUTHORIZED SCREEN (Phases 19 & 20)
  if (!session || forbiddenError?.startsWith('401') || forbiddenError?.startsWith('403')) {
    return (
      <div className="admin-forbidden-container">
        <div className="forbidden-card glass-card">
          <ShieldAlert size={48} className="icon-rose" />
          <h2>403 Forbidden: Admin Access Restricted</h2>
          <p>
            You are attempting to access a protected WeatherGPT Administrator Area. You must be authenticated as a verified administrator (e.g. Creator <code>srividya</code>) to view this dashboard.
          </p>

          {forbiddenError && (
            <div className="forbidden-error-box">
              <Lock size={15} /> <span>{forbiddenError}</span>
            </div>
          )}

          <div className="forbidden-actions-row">
            <button className="btn btn-primary" onClick={() => setLoginModalOpen(true)}>
              <ShieldCheck size={16} /> Sign In as Administrator
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              Return to WeatherGPT Home
            </button>
          </div>
        </div>

        <AdminLoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLoginSuccess={(newSession) => {
            setSession(newSession);
            setLoginModalOpen(false);
            loadDashboardData(newSession.token);
          }}
        />
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Top Banner Header */}
      <div className="admin-header-bar glass-card">
        <div className="header-brand-info">
          <Crown size={28} className="icon-amber" />
          <div>
            <h1 className="admin-page-title">WeatherGPT Admin Control Center</h1>
            <p className="admin-page-sub">
              Platform administration, role-based access control, and telemetry analytics.
            </p>
          </div>
        </div>

        <div className="admin-user-profile-badge">
          <div className="admin-badge-details">
            <span className="admin-name">{session.user.fullName}</span>
            <span className="admin-role-pill">
              👑 {session.user.role === 'PRIMARY_ADMIN' ? 'Creator (Primary Admin)' : session.user.role}
            </span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => loadDashboardData(session.token)}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn btn-secondary btn-sm btn-rose-hover" onClick={handleLogout}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* Action Toast Notifications */}
      {actionSuccess && (
        <div className="admin-toast toast-success glass-card">
          <CheckCircle size={16} /> <span>{actionSuccess}</span>
        </div>
      )}
      {forbiddenError && (
        <div className="admin-toast toast-error glass-card">
          <AlertCircle size={16} /> <span>{forbiddenError}</span>
        </div>
      )}

      {/* Main Tab Bar */}
      <div className="admin-dashboard-tabs">
        <button
          className={`tab-item ${activeTab === 'OVERVIEW' ? 'active' : ''}`}
          onClick={() => setActiveTab('OVERVIEW')}
        >
          <BarChart3 size={16} /> System Overview
        </button>
        <button
          className={`tab-item ${activeTab === 'USERS' ? 'active' : ''}`}
          onClick={() => setActiveTab('USERS')}
        >
          <Users size={16} /> User & Role Management ({usersList.length})
        </button>
        <button
          className={`tab-item ${activeTab === 'ANALYTICS' ? 'active' : ''}`}
          onClick={() => setActiveTab('ANALYTICS')}
        >
          <Activity size={16} /> Weather & Risk Analytics
        </button>
        <button
          className={`tab-item ${activeTab === 'SYSTEM' ? 'active' : ''}`}
          onClick={() => setActiveTab('SYSTEM')}
        >
          <Server size={16} /> System Health Checks
        </button>
        <button
          className={`tab-item ${activeTab === 'AUDIT' ? 'active' : ''}`}
          onClick={() => setActiveTab('AUDIT')}
        >
          <FileText size={16} /> Admin Audit Log ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeTab === 'OVERVIEW' && stats && (
        <div className="tab-pane-content">
          <div className="stats-overview-grid">
            <div className="stat-card glass-card">
              <div className="stat-icon-box bg-cyan-glow">
                <Users size={22} className="icon-cyan" />
              </div>
              <div className="stat-details">
                <span className="stat-value">{stats.totalUsers}</span>
                <span className="stat-label">Total Users Registered</span>
              </div>
            </div>

            <div className="stat-card glass-card">
              <div className="stat-icon-box bg-violet-glow">
                <Activity size={22} className="icon-violet" />
              </div>
              <div className="stat-details">
                <span className="stat-value">{stats.totalWeatherQueries}</span>
                <span className="stat-label">Weather Queries Executed</span>
              </div>
            </div>

            <div className="stat-card glass-card">
              <div className="stat-icon-box bg-emerald-glow">
                <TrendingUp size={22} className="icon-emerald" />
              </div>
              <div className="stat-details">
                <span className="stat-value">{stats.totalRiskAnalyses}</span>
                <span className="stat-label">Activity Risk Assessments</span>
              </div>
            </div>

            <div className="stat-card glass-card">
              <div className="stat-icon-box bg-amber-glow">
                <Globe size={22} className="icon-amber" />
              </div>
              <div className="stat-details">
                <span className="stat-value">{stats.supportedLanguages} Languages</span>
                <span className="stat-label">Multilingual Conversation Engine</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER & ROLE MANAGEMENT */}
      {activeTab === 'USERS' && (
        <div className="tab-pane-content">
          <div className="user-management-layout">
            {/* Registered Users Table */}
            <div className="table-section-card glass-card">
              <div className="section-title-bar">
                <h3><Users size={18} className="icon-cyan" /> Registered User Accounts ({usersList.length})</h3>
                <span className="badge badge-ai">Role-Based Access Control Active</span>
              </div>

              <div className="users-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User Details</th>
                      <th>Current Role</th>
                      <th>Creation Date</th>
                      <th>Created By</th>
                      <th>Role Management Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <strong>{u.fullName}</strong>
                          <div className="user-handle">@{u.username}</div>
                        </td>
                        <td>
                          {u.role === 'PRIMARY_ADMIN' ? (
                            <span className="role-pill pill-primary"><Crown size={12} /> Creator (Primary)</span>
                          ) : u.role === 'SECONDARY_ADMIN' ? (
                            <span className="role-pill pill-secondary"><Medal size={12} /> Secondary Admin</span>
                          ) : u.role === 'TERTIARY_ADMIN' ? (
                            <span className="role-pill pill-tertiary"><Award size={12} /> Tertiary Admin</span>
                          ) : (
                            <span className="role-pill pill-user"><Users size={12} /> Standard User</span>
                          )}
                        </td>
                        <td>{u.createdAt}</td>
                        <td>{u.createdBy}</td>
                        <td>
                          {u.username.toLowerCase() !== 'srividya' ? (
                            <div className="role-actions-cell">
                              <select
                                className="input-field select-sm"
                                value={u.role}
                                onChange={(e) => handleRoleChange(u.id, e.target.value as AdminRole)}
                              >
                                <option value="SECONDARY_ADMIN">Secondary Admin</option>
                                <option value="TERTIARY_ADMIN">Tertiary Admin</option>
                                <option value="user">Standard User</option>
                              </select>

                              <button
                                className="btn-icon-delete"
                                onClick={() => handleDeleteAdmin(u.id, u.username)}
                                title="Revoke Account Access"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ) : (
                            <span className="locked-creator-tag">🔒 Creator Account</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Admit New Admin Form */}
            <div className="admit-form-card glass-card">
              <div className="section-title-bar">
                <h3><UserPlus size={18} className="icon-emerald" /> Admit New Admin Account</h3>
              </div>

              <form onSubmit={handleAddAdminSubmit} className="admit-form">
                <div className="form-group">
                  <label className="form-label">Full Name:</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Manager Smith"
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
                  <label className="form-label">Assign Password:</label>
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
                  <label className="form-label">Role Privilege Level:</label>
                  <select
                    className="input-field select-field"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as AdminRole)}
                  >
                    <option value="SECONDARY_ADMIN">🥈 Secondary Admin (Manager)</option>
                    <option value="TERTIARY_ADMIN">🥉 Tertiary Admin (Operator)</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary btn-submit-admit">
                  <UserPlus size={16} /> Admit Admin User
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WEATHER & RISK ANALYTICS */}
      {activeTab === 'ANALYTICS' && (
        <div className="tab-pane-content">
          <div className="analytics-grid">
            {/* Risk Distribution Breakdown */}
            <div className="analytics-card glass-card">
              <h3><TrendingUp size={18} className="icon-amber" /> Activity Risk Score Distribution</h3>
              <p className="card-sub">Deterministic 5-tier risk classifications computed across user queries.</p>

              {riskAnalytics?.riskDistribution && (
                <div className="risk-dist-bars">
                  <div className="dist-row">
                    <span className="dist-label">LOW (0-20):</span>
                    <div className="bar-track"><div className="bar-fill fill-low" style={{ width: '45%' }}></div></div>
                    <span className="dist-count">{riskAnalytics.riskDistribution.LOW}</span>
                  </div>

                  <div className="dist-row">
                    <span className="dist-label">MODERATE (21-40):</span>
                    <div className="bar-track"><div className="bar-fill fill-moderate" style={{ width: '35%' }}></div></div>
                    <span className="dist-count">{riskAnalytics.riskDistribution.MODERATE}</span>
                  </div>

                  <div className="dist-row">
                    <span className="dist-label">ELEVATED (41-60):</span>
                    <div className="bar-track"><div className="bar-fill fill-elevated" style={{ width: '25%' }}></div></div>
                    <span className="dist-count">{riskAnalytics.riskDistribution.ELEVATED}</span>
                  </div>

                  <div className="dist-row">
                    <span className="dist-label">HIGH (61-80):</span>
                    <div className="bar-track"><div className="bar-fill fill-high" style={{ width: '60%' }}></div></div>
                    <span className="dist-count">{riskAnalytics.riskDistribution.HIGH}</span>
                  </div>

                  <div className="dist-row">
                    <span className="dist-label">SEVERE (81-100):</span>
                    <div className="bar-track"><div className="bar-fill fill-severe" style={{ width: '20%' }}></div></div>
                    <span className="dist-count">{riskAnalytics.riskDistribution.SEVERE}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Popular Language Analytics */}
            <div className="analytics-card glass-card">
              <h3><Globe size={18} className="icon-cyan" /> Multilingual Engine Usage</h3>
              <p className="card-sub">Regional & mixed-language WeatherGPT query breakdown.</p>

              {multilingualAnalytics?.languages && (
                <div className="language-analytics-list">
                  {multilingualAnalytics.languages.map((l: any) => (
                    <div key={l.code} className="lang-stat-row">
                      <span className="lang-name">{l.name}</span>
                      <span className="lang-count-chip">{l.count} Queries</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM HEALTH */}
      {activeTab === 'SYSTEM' && systemHealth && (
        <div className="tab-pane-content">
          <div className="system-health-grid">
            {systemHealth.services.map((s: any) => (
              <div key={s.name} className="health-card glass-card">
                <Server size={24} className="icon-emerald" />
                <div className="health-info">
                  <h4>{s.name}</h4>
                  <span className="health-status-badge">
                    <CheckCircle size={13} /> {s.status}
                  </span>
                  <span className="health-latency">Latency: {s.latency || s.capacity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOG */}
      {activeTab === 'AUDIT' && (
        <div className="tab-pane-content">
          <div className="audit-section-card glass-card">
            <h3><FileText size={18} className="icon-cyan" /> Administrative Activity & Security Log</h3>
            <p className="card-sub">Tracks admin logins, role assignments, and platform security events.</p>

            <table className="admin-table audit-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Admin Actor</th>
                  <th>Action Event</th>
                  <th>Event Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((a) => (
                  <tr key={a.id}>
                    <td>{a.timestamp}</td>
                    <td><strong>@{a.actorUsername}</strong></td>
                    <td><span className="event-action-tag">{a.action}</span></td>
                    <td>{a.targetDetails}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
