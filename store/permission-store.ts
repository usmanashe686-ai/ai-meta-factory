import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'commenter';

export interface UserPermission {
  userId: string;
  projectId: string;
  role: UserRole;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
}

export interface ProjectPermission {
  id: string;
  name: string;
  description: string;
  roles: UserRole[];
}

export const defaultPermissions: ProjectPermission[] = [
  {
    id: 'view_project',
    name: 'View Project',
    description: 'Can view the project',
    roles: ['owner', 'admin', 'editor', 'viewer', 'commenter']
  },
  {
    id: 'edit_components',
    name: 'Edit Components',
    description: 'Can add, edit, and remove components',
    roles: ['owner', 'admin', 'editor']
  },
  {
    id: 'edit_layout',
    name: 'Edit Layout',
    description: 'Can edit the canvas layout',
    roles: ['owner', 'admin', 'editor']
  },
  {
    id: 'add_comments',
    name: 'Add Comments',
    description: 'Can add comments and annotations',
    roles: ['owner', 'admin', 'editor', 'commenter']
  },
  {
    id: 'resolve_comments',
    name: 'Resolve Comments',
    description: 'Can mark comments as resolved',
    roles: ['owner', 'admin', 'editor']
  },
  {
    id: 'manage_users',
    name: 'Manage Users',
    description: 'Can invite and remove users',
    roles: ['owner', 'admin']
  },
  {
    id: 'export_project',
    name: 'Export Project',
    description: 'Can export the project',
    roles: ['owner', 'admin', 'editor']
  },
  {
    id: 'delete_project',
    name: 'Delete Project',
    description: 'Can delete the project',
    roles: ['owner', 'admin']
  }
];

interface PermissionStore {
  permissions: UserPermission[];
  currentUserRole: UserRole | null;
  
  setCurrentUserRole: (role: UserRole) => void;
  grantPermission: (permission: Omit<UserPermission, 'grantedAt'>) => void;
  revokePermission: (userId: string, projectId: string) => void;
  updatePermission: (userId: string, projectId: string, role: UserRole) => void;
  getUserRole: (userId: string, projectId: string) => UserRole | null;
  hasPermission: (userId: string, projectId: string, permissionId: string) => boolean;
  getProjectUsers: (projectId: string) => UserPermission[];
  can: (permissionId: string) => boolean;
}

export const usePermissionStore = create<PermissionStore>()(
  persist(
    (set, get) => ({
      permissions: [],
      currentUserRole: 'editor',
      
      setCurrentUserRole: (role) => {
        set({ currentUserRole: role });
      },
      
      grantPermission: (permissionData) => {
        const newPermission: UserPermission = {
          ...permissionData,
          grantedAt: new Date().toISOString()
        };
        
        set((state) => ({
          permissions: [...state.permissions, newPermission]
        }));
      },
      
      revokePermission: (userId, projectId) => {
        set((state) => ({
          permissions: state.permissions.filter(
            (p) => !(p.userId === userId && p.projectId === projectId)
          )
        }));
      },
      
      updatePermission: (userId, projectId, role) => {
        set((state) => ({
          permissions: state.permissions.map((p) =>
            p.userId === userId && p.projectId === projectId
              ? { ...p, role, grantedAt: new Date().toISOString() }
              : p
          )
        }));
      },
      
      getUserRole: (userId, projectId) => {
        const state = get();
        const permission = state.permissions.find(
          (p) => p.userId === userId && p.projectId === projectId
        );
        return permission ? permission.role : null;
      },
      
      hasPermission: (userId, projectId, permissionId) => {
        const state = get();
        const permission = state.permissions.find(
          (p) => p.userId === userId && p.projectId === projectId
        );
        
        if (!permission) return false;
        
        const requiredPermission = defaultPermissions.find(
          (p) => p.id === permissionId
        );
        
        if (!requiredPermission) return false;
        
        return requiredPermission.roles.includes(permission.role);
      },
      
      getProjectUsers: (projectId) => {
        const state = get();
        return state.permissions.filter((p) => p.projectId === projectId);
      },
      
      can: (permissionId) => {
        const state = get();
        const { currentUserRole } = state;
        
        if (!currentUserRole) return false;
        
        const requiredPermission = defaultPermissions.find(
          (p) => p.id === permissionId
        );
        
        if (!requiredPermission) return false;
        
        return requiredPermission.roles.includes(currentUserRole);
      }
    }),
    {
      name: 'permission-storage',
      version: 1
    }
  )
);
