import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Settings, 
  ChevronRight, 
  ChevronDown,
  UserPlus,
  Folder,
  Globe,
  Lock,
  Mail
} from 'lucide-react';
import { useTeamStore } from '@/store/team-store';
import { Team, UserRole } from '@/lib/types/team';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CreateTeamDialog } from './CreateTeamDialog';
import { InviteMemberDialog } from './InviteMemberDialog';
import { ShareProjectDialog } from './ShareProjectDialog';

export const TeamSidebar: React.FC = () => {
  const { userTeams, currentTeam, setCurrentTeam } = useTeamStore();
  const [expandedTeams, setExpandedTeams] = useState<string[]>([]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  const toggleTeam = (teamId: string) => {
    setExpandedTeams(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };
  
  const handleTeamSelect = (team: Team) => {
    setCurrentTeam(team);
  };
  
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'editor': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Teams
          </h2>
          <Button
            size="sm"
            onClick={() => setShowCreateTeam(true)}
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            New Team
          </Button>
        </div>
        
        {currentTeam && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{currentTeam.name}</h3>
                <p className="text-sm text-gray-600">
                  {currentTeam.members?.length || 0} members
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowInviteDialog(true)}
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Teams List */}
      <div className="p-2">
        {userTeams.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No teams yet</p>
            <Button
              variant="link"
              onClick={() => setShowCreateTeam(true)}
              className="mt-2"
            >
              Create your first team
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {userTeams.map((team) => {
              const isExpanded = expandedTeams.includes(team.id);
              const isSelected = currentTeam?.id === team.id;
              
              return (
                <div key={team.id} className="rounded-lg">
                  {/* Team Header */}
                  <div
                    className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 rounded-lg ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleTeamSelect(team)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTeam(team.id);
                        }}
                      >
                        {team.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{team.name}</h3>
                        <p className="text-xs text-gray-500">
                          {team.members?.length || 0} members
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded ${getRoleColor(
                        team.members?.find(m => m.userId === team.ownerId)?.role || 'viewer'
                      )}`}>
                        {team.members?.find(m => m.userId === team.ownerId)?.role}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTeam(team.id);
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Team Details (Expanded) */}
                  {isExpanded && (
                    <div className="ml-11 pl-3 border-l border-gray-200 space-y-1">
                      {/* Projects */}
                      <div className="p-2 hover:bg-gray-50 rounded flex items-center gap-2 cursor-pointer">
                        <Folder className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">Projects ({team.projects?.length || 0})</span>
                      </div>
                      
                      {/* Members */}
                      <div className="p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">Members</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowInviteDialog(true)}
                          >
                            <UserPlus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {team.members?.slice(0, 3).map((member) => (
                            <div key={member.userId} className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={member.user?.avatar} />
                                <AvatarFallback>
                                  {member.user?.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">{member.user?.name}</p>
                              </div>
                              <span className={`px-2 py-0.5 text-xs rounded ${getRoleColor(member.role)}`}>
                                {member.role}
                              </span>
                            </div>
                          ))}
                          {team.members && team.members.length > 3 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{team.members.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="pt-2 space-y-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setShowShareDialog(true)}
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          Share Project
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Team Settings
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Dialogs */}
      <CreateTeamDialog
        open={showCreateTeam}
        onOpenChange={setShowCreateTeam}
      />
      
      <InviteMemberDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        team={currentTeam}
      />
      
      <ShareProjectDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        team={currentTeam}
      />
    </div>
  );
};
