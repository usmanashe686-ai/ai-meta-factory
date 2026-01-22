export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
  GUEST = 'guest'
}

export enum ProjectPermission {
  VIEW = 'view',
  EDIT = 'edit',
  DELETE = 'delete',
  INVITE = 'invite',
  MANAGE = 'manage'
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  lastActive?: string;
  isOnline: boolean;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
  projects: TeamProject[];
  settings: TeamSettings;
}

export interface TeamMember {
  userId: string;
  teamId: string;
  role: UserRole;
  joinedAt: string;
  invitedBy?: string;
  user?: User; // Populated on fetch
}

export interface TeamProject {
  projectId: string;
  teamId: string;
  permissions: ProjectPermission[];
  addedAt: string;
  addedBy: string;
}

export interface TeamSettings {
  allowPublicSharing: boolean;
  requireApproval: boolean;
  defaultRole: UserRole;
  maxProjects: number;
  maxMembers: number;
}

export interface Invitation {
  id: string;
  email: string;
  teamId: string;
  role: UserRole;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  token: string;
}

export interface ProjectShare {
  id: string;
  projectId: string;
  shareType: 'public' | 'private' | 'team';
  accessLevel: 'view' | 'edit' | 'comment';
  password?: string;
  expiresAt?: string;
  maxUses?: number;
  uses: number;
  createdBy: string;
  createdAt: string;
  urlToken: string;
}
