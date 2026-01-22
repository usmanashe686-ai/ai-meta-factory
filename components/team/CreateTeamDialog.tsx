import React, { useState } from 'react';
import { Users, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTeamStore } from '@/store/team-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';

const teamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(50),
  description: z.string().max(200).optional(),
});

type TeamFormData = z.infer<typeof teamSchema>;

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTeamDialog: React.FC<CreateTeamDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { addTeam, currentUser } = useTeamStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });
  
  const onSubmit = async (data: TeamFormData) => {
    if (!currentUser) {
      toast.error('You must be logged in to create a team');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call
      const newTeam = {
        id: `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: data.name,
        description: data.description,
        ownerId: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        members: [
          {
            userId: currentUser.id,
            teamId: '',
            role: 'owner',
            joinedAt: new Date().toISOString(),
            user: currentUser,
          },
        ],
        projects: [],
        settings: {
          allowPublicSharing: true,
          requireApproval: false,
          defaultRole: 'viewer',
          maxProjects: 10,
          maxMembers: 50,
        },
      };
      
      // Add to store
      addTeam(newTeam);
      
      // Success
      toast.success(`Team "${data.name}" created successfully!`);
      reset();
      onOpenChange(false);
      
      // Emit socket event for real-time updates
      if (window.socket) {
        window.socket.emit('team-created', newTeam);
      }
      
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Create New Team</h2>
              <p className="text-sm text-gray-500">
                Collaborate with others on projects
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Team Name *
            </label>
            <Input
              {...register('name')}
              placeholder="e.g., Design Team, Engineering"
              className="w-full"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Description (Optional)
            </label>
            <Textarea
              {...register('description')}
              placeholder="What's this team for?"
              className="w-full min-h-[100px]"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              Briefly describe your team's purpose
            </p>
          </div>
          
          {/* Permissions Preview */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Default Permissions</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Team Owner</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                  Full Access
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Invited Members</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                  Viewer (Default)
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              You can adjust permissions after creating the team
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Team'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
