'use client';

import { TemplateGallery } from '@/components/templates/TemplateGallery';
import { Button } from '@/components/ui/button';
import { useTeamStore } from '@/store/team-store';
import { Users, Globe, Shield, Zap } from 'lucide-react';

export default function TeamPage() {
  const { currentTeam, userTeams } = useTeamStore();
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Team Collaboration</h1>
            <p className="text-blue-100">
              Build amazing AI apps together with your team
            </p>
          </div>
          <div className="flex gap-3 mt-4 lg:mt-0">
            <Button variant="secondary" className="bg-white/20 hover:bg-white/30">
              <Users className="w-4 h-4 mr-2" />
              Invite Members
            </Button>
            <Button className="bg-white text-blue-600 hover:bg-gray-100">
              <Zap className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Teams</h3>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">{userTeams.length}</p>
          <p className="text-gray-600 text-sm mt-1">Active teams</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Active Projects</h3>
            <Globe className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold">
            {userTeams.reduce((acc, team) => acc + (team.projects?.length || 0), 0)}
          </p>
          <p className="text-gray-600 text-sm mt-1">Across all teams</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Collaborators</h3>
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold">
            {userTeams.reduce((acc, team) => acc + (team.members?.length || 0), 0)}
          </p>
          <p className="text-gray-600 text-sm mt-1">Total team members</p>
        </div>
      </div>
      
      {/* Current Team Info */}
      {currentTeam && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{currentTeam.name}</h2>
              {currentTeam.description && (
                <p className="text-gray-600 mt-1">{currentTeam.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {currentTeam.members?.length || 0} members
              </span>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button>
              <Users className="w-4 h-4 mr-2" />
              Manage Members
            </Button>
            <Button variant="outline">
              <Globe className="w-4 h-4 mr-2" />
              Share Projects
            </Button>
            <Button variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Team Settings
            </Button>
          </div>
        </div>
      )}
      
      {/* Template Gallery Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Template Gallery</h2>
            <p className="text-gray-600">
              Start quickly with pre-built templates
            </p>
          </div>
        </div>
        <TemplateGallery />
      </div>
    </div>
  );
}
