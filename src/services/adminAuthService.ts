/**
 * ADMIN AUTHENTICATION & MANAGEMENT SERVICE
 * Manages Creator (srividya / 12345*) primary credentials and hierarchy of secondary/tertiary admins.
 */

export type AdminRole = 'PRIMARY_ADMIN' | 'SECONDARY_ADMIN' | 'TERTIARY_ADMIN';

export interface AdminUser {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: AdminRole;
  createdAt: string;
  createdBy: string;
}

export interface AdminSession {
  user: AdminUser;
  token: string;
  loggedInAt: string;
}

const STORAGE_KEY_ADMIN_USERS = 'weathergpt_admin_users_v2';
const STORAGE_KEY_ADMIN_SESSION = 'weathergpt_admin_session_v2';

// Pre-configured Creator Account as requested
const DEFAULT_CREATOR: AdminUser = {
  id: 'admin-creator-001',
  username: 'srividya',
  password: '12345*',
  fullName: 'Srividya (Creator & Primary Admin)',
  role: 'PRIMARY_ADMIN',
  createdAt: '2026-08-31T00:00:00.000Z',
  createdBy: 'System Root'
};

/**
 * Initializes and retrieves the registered admin users list.
 */
export function getAdminUsers(): AdminUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_USERS);
    if (raw) {
      const parsed: AdminUser[] = JSON.parse(raw);
      // Ensure primary creator account always exists and password matches request
      const creatorIndex = parsed.findIndex((u) => u.username.toLowerCase() === 'srividya');
      if (creatorIndex >= 0) {
        parsed[creatorIndex] = {
          ...parsed[creatorIndex],
          password: '12345*',
          role: 'PRIMARY_ADMIN',
          fullName: 'Srividya (Creator & Primary Admin)'
        };
      } else {
        parsed.unshift(DEFAULT_CREATOR);
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse admin users:', e);
  }

  const initialList = [DEFAULT_CREATOR];
  saveAdminUsers(initialList);
  return initialList;
}

export function saveAdminUsers(users: AdminUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save admin users:', e);
  }
}

/**
 * Authenticates Admin Login Credentials.
 */
export function authenticateAdmin(uInput: string, pInput: string): AdminSession {
  const usernameClean = uInput.trim();
  const passwordClean = pInput.trim();

  const users = getAdminUsers();
  const matched = users.find(
    (u) => u.username.toLowerCase() === usernameClean.toLowerCase() && u.password === passwordClean
  );

  if (!matched) {
    throw new Error('Invalid Admin Username or Password.');
  }

  const sessionUser: AdminUser = {
    id: matched.id,
    username: matched.username,
    fullName: matched.fullName,
    role: matched.role,
    createdAt: matched.createdAt,
    createdBy: matched.createdBy
  };

  const session: AdminSession = {
    user: sessionUser,
    token: `token-admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    loggedInAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  try {
    localStorage.setItem(STORAGE_KEY_ADMIN_SESSION, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to store admin session:', e);
  }

  return session;
}

/**
 * Returns current active Admin Session or null.
 */
export function getCurrentAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_SESSION);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to get current admin session:', e);
  }
  return null;
}

/**
 * Log out active admin.
 */
export function logoutAdmin(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
  } catch (e) {
    console.error('Failed to clear admin session:', e);
  }
}

/**
 * Admits / Registers a New Secondary or Tertiary Admin.
 * Only Creator (Primary) can add Secondary & Tertiary admins. Secondary admins can add Tertiary admins.
 */
export function addAdminUser(
  newUserPayload: { username: string; password: string; fullName: string; role: AdminRole },
  currentSession: AdminSession
): AdminUser {
  const { username, password, fullName, role } = newUserPayload;

  if (!username.trim() || username.trim().length < 3) {
    throw new Error('Username must be at least 3 characters.');
  }
  if (!password.trim() || password.trim().length < 4) {
    throw new Error('Password must be at least 4 characters.');
  }
  if (!fullName.trim()) {
    throw new Error('Please enter a Full Name for the new admin.');
  }

  // Privilege enforcement
  if (currentSession.user.role === 'TERTIARY_ADMIN') {
    throw new Error('Tertiary admins do not have permission to admit new admin users.');
  }
  if (currentSession.user.role === 'SECONDARY_ADMIN' && role === 'SECONDARY_ADMIN') {
    throw new Error('Secondary admins can only admit Tertiary admins. Creator (srividya) can admit Secondary & Tertiary admins.');
  }
  if (role === 'PRIMARY_ADMIN' && currentSession.user.username.toLowerCase() !== 'srividya') {
    throw new Error('Only Creator (srividya) holds Primary Admin privileges.');
  }

  const users = getAdminUsers();
  const existing = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
  if (existing) {
    throw new Error(`Admin user '${username.trim()}' already exists.`);
  }

  const createdUser: AdminUser = {
    id: `admin-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    username: username.trim(),
    password: password.trim(),
    fullName: fullName.trim(),
    role,
    createdAt: new Date().toISOString().split('T')[0],
    createdBy: currentSession.user.fullName
  };

  users.push(createdUser);
  saveAdminUsers(users);

  return createdUser;
}

/**
 * Deletes / Revokes Secondary or Tertiary Admin Account.
 */
export function deleteAdminUser(adminId: string, currentSession: AdminSession): void {
  const users = getAdminUsers();
  const target = users.find((u) => u.id === adminId);

  if (!target) {
    throw new Error('Target admin user not found.');
  }

  if (target.role === 'PRIMARY_ADMIN' || target.username.toLowerCase() === 'srividya') {
    throw new Error('The Creator account (srividya) cannot be deleted.');
  }

  if (currentSession.user.role === 'TERTIARY_ADMIN') {
    throw new Error('Tertiary admins cannot revoke admin accounts.');
  }

  const updatedList = users.filter((u) => u.id !== adminId);
  saveAdminUsers(updatedList);
}
