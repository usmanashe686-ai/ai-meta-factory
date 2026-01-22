import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Team, User, UserRole, Invitation, ProjectShare } from '@/lib/types/team';

interface TeamState {
  // Current user
  currentUser: User | null;
  
  // Teams
  currentTeam: Team | null;
  userTeams: Team[];
  
  // Invitations
  pendingInvitations: Invitation[];
  
  // Project shares
  projectShares: ProjectShare[];
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  setCurrentTeam: (team: Team | null) => void;
  setUserTeams: (teams: Team[]) => void;
  addTeam: (team: Team) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  removeTeam: (teamId: string) => void;
  
  // Member actions
  addMember: (teamId: string, member: any) => void;
  updateMemberRole: (teamId: string, userId: string, role: UserRole) => void;
  removeMember: (teamId: string, userId: string) => void;
  
  // Invitation actions
  addInvitation: (invitation: Invitation) => void;
  updateInvitation: (invitationId: string, updates: Partial<Invitation>) => void;
  removeInvitation: (invitationId: string) => void;
  
  // Project share actions
  addProjectShare: (share: ProjectShare) => void;
  updateProjectShare: (shareId: string, updates: Partial<ProjectShare>) => void;
  removeProjectShare: (shareId: string) => void;
  
  // Utility
  hasPermission: (teamId: string, permission: string) => boolean;
  getTeamMembers: (teamId: string) => any[];
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      currentTeam: null,
      userTeams: [],
      pendingInvitations: [],
      projectShares: [],
      
      // Actions
      setCurrentUser: (user) => set({ currentUser: user }),
      
      setCurrentTeam: (team) => set({ currentTeam: team }),
      
      setUserTeams: (teams) => set({ userTeams: teams }),
      
      addTeam: (team) =>
        set((state) => ({
          userTeams: [...state.userTeams, team]
        })),
      
      updateTeam: (teamId, updates) =>
        set((state) => ({
          userTeams: state.userTeams.map((team) =>
            team.id === teamId ? { ...team, ...updates } : team
          ),
          currentTeam: state.currentTeam?.id === teamId 
            ? { ...state.currentTeam, ...updates }
            : state.currentTeam
        })),
      
      removeTeam: (teamId) =>
        set((state) => ({
          userTeams: state.userTeams.filter((team) => team.id !== teamId),
          currentTeam: state.currentTeam?.id === teamId ? null : state.currentTeam
        })),
      
      // Member actions
      addMember: (teamId, member) =>
        set((state) => ({
          userTeams: state.userTeams.map((team) =>
            team.id === teamId
              ? {
                  ...team,
                  members: [...team.members, member]
                }
              : team
          )
        })),
      
      updateMemberRole: (teamId, userId, role) =>
        set((state) => ({
          userTeams: state.userTeams.map((team) =>
            team.id === teamId
              ? {
                  ...team,
                  members: team.members.map((member) =>
                    member.userId === userId ? { ...member, role } : member
                  )
                }
              : team
          )
        })),
      
      removeMember: (teamId, userId) =>
        set((state) => ({
          userTeams: state.userTeams.map((team) =>
            team.id === teamId
              ? {
                  ...team,
                  members: team.members.filter((member) => member.userId !== userId)
                }
              : team
          )
        })),
      
      // Invitation actions
      addInvitation: (invitation) =>
        set((state) => ({
          pendingInvitations: [...state.pendingInvitations, invitation]
        })),
      
      updateInvitation: (invitationId, updates) =>
        set((state) => ({
          pendingInvitations: state.pendingInvitations.map((inv) =>
            inv.id === invitationId ? { ...inv, ...updates } : inv
          )
        })),
      
      removeInvitation: (invitationId) =>
        set((state) => ({
          pendingInvitations: state.pendingInvitations.filter(
            (inv) => inv.id !== invitationId
          )
        })),
      
      // Project share actions
      addProjectShare: (share) =>
        set((state) => ({
          projectShares: [...state.projectShares, share]
        })),
      
      updateProjectShare: (shareId, updates) =>
        set((state) => ({
          projectShares: state.projectShares.map((share) =>
            share.id === shareId ? { ...share, ...updates } : share
          )
        })),
      
      removeProjectShare: (shareId) =>
        set((state) => ({
          projectShares: state.projectShares.filter((share) => share.id !== shareId)
        })),
      
      // Utility functions
      hasPermission: (teamId, permission) => {
        const team = get().userTeams.find((t) => t.id === teamId);
        const currentUser = get().currentUser;
        
        if (!team || !currentUser) return false;
        
        const member = team.members.find((m) => m.userId === currentUser.id);
        if (!member) return false;
        
        // Simple permission check - expand based on your needs
        switch (member.role) {
          case 'owner':
            return true;
          case 'admin':
            return permission !== 'delete_team';
          case 'editor':
            return ['view', 'edit', 'comment'].includes(permission);
          case 'viewer':
            return permission === 'view';
          default:
            return false;
        }
      },
      
      getTeamMembers: (teamId) => {
        const team = get().userTeams.find((t) => t.id === teamId);
        return team?.members || [];
      }
    }),
    {
      name: 'team-storage',
      version: 1
    }
  )
);
