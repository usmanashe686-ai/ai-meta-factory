// ============================================================================
// AI Meta Factory – Shared User Type (Backend & Frontend)
// ============================================================================

export type UserId = string;

export interface User {
  id: UserId;
  email: string;
  username?: string;
  name?: string;
  avatar?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Only present on backend responses – never sent to client
  passwordHash?: string;
  provider?: 'local' | 'github' | 'google' | 'discord';
  providerId?: string;
  
  // Preferences
  settings?: Record<string, any>;
}

export interface UserProfile {
  id: UserId;
  username?: string;
  name?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  github?: string;
  twitter?: string;
}

export interface ApiKey {
  id: string;
  userId: UserId;
  key: string; // hashed in DB, plaintext only on creation
  name: string;
  lastUsed?: Date;
  expiresAt?: Date;
  createdAt: Date;
  scopes: string[];
}
