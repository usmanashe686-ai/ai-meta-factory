import React, { useState } from 'react';
import { 
  Link, 
  Copy, 
  Globe, 
  Lock, 
  Users, 
  X, 
  Calendar,
  Shield,
  Check
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTeamStore } from '@/store/team-store';
import { useProjectStore } from '@/store/project-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { Team } from '@/lib/types/team';

const shareSchema = z.object({
  accessLevel: z.enum(['view', 'edit', 'comment']),
  shareType: z.enum(['public', 'private', 'team']),
  password: z.string().optional(),
  expiresAt: z.string().optional(),
  maxUses: z.number().optional(),
});

type ShareFormData = z.infer<typeof shareSchema>;

interface ShareProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team?: Team | null;
}

export const ShareProjectDialog: React.FC<ShareProjectDialogProps> = ({
  open,
  onOpenChange,
  team,
}) => {
  const { addProjectShare } = useTeamStore();
  const { metadata } = useProjectStore();
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ShareFormData>({
    resolver: zodResolver(shareSchema),
    defaultValues: {
      accessLevel: 'view',
      shareType: 'private',
    },
  });
  
  const shareType = watch('shareType');
  const accessLevel = watch('accessLevel');
  const requiresPassword = watch('password');
  
  const generateShareLink = (token: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/shared/${token}`;
  };
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };
  
  const onSubmit = async (data: ShareFormData) => {
    setIsSubmitting(true);
    
    try {
      // Generate unique token
      const token = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const shareLink = generateShareLink(token);
      
      // Create share object
      const newShare = {
        id: token,
        projectId: metadata.id,
        shareType: data.shareType,
        accessLevel: data.accessLevel,
        password: data.password,
        expiresAt: data.expiresAt,
        maxUses: data.maxUses,
        uses: 0,
        createdBy: 'current-user-id', // Replace with actual user ID
        createdAt: new Date().toISOString(),
        urlToken: token,
      };
      
      // Add to store
      addProjectShare(newShare);
      
      // Generate shareable link
      setGeneratedLink(shareLink);
      
      // Emit socket event
      if (window.socket) {
        window.socket.emit('project-shared', {
          projectId: metadata.id,
          share: newShare,
          link: shareLink,
        });
      }
      
      toast.success('Share link created successfully!');
      
    } catch (error) {
      console.error('Error creating share:', error);
      toast.error('Failed to create share link');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReset = () => {
    reset();
    setGeneratedLink('');
    onOpenChange(false);
  };
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Link className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Share Project</h2>
              <p className="text-sm text-gray-500">
                {metadata.name || 'Untitled Project'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {!generatedLink ? (
            // Share Settings Form
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Share Type */}
              <div>
                <h3 className="font-medium mb-3">Who can access</h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {}}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      shareType === 'public'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Globe className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Public</div>
                    <p className="text-xs text-gray-500">Anyone with the link</p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {}}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      shareType === 'private'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Lock className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Private</div>
                    <p className="text-xs text-gray-500">Specific people</p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {}}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      shareType === 'team'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Users className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Team</div>
                    <p className="text-xs text-gray-500">{team?.name || 'Team members'}</p>
                  </button>
                </div>
              </div>
              
              {/* Access Level */}
              <div>
                <h3 className="font-medium mb-3">Permission Level</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['view', 'comment', 'edit'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => {}}
                      className={`p-4 border rounded-lg text-center transition-colors ${
                        accessLevel === level
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Shield className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium capitalize">{level}</div>
                      <p className="text-xs text-gray-500">
                        {level === 'view' && 'Can view only'}
                        {level === 'comment' && 'Can view & comment'}
                        {level === 'edit' && 'Can edit project'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Security Options */}
              <div className="space-y-4">
                <h3 className="font-medium">Security Options</h3>
                
                {/* Password Protection */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      <span>Password Protection</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        {...register('password')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  {requiresPassword && (
                    <Input
                      type="password"
                      placeholder="Enter password"
                      className="mt-2"
                    />
                  )}
                </div>
                
                {/* Expiration */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Link Expiration</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        {...register('expiresAt')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  {watch('expiresAt') && (
                    <Input
                      type="datetime-local"
                      className="mt-2"
                    />
                  )}
                </div>
                
                {/* Usage Limits */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Usage Limit</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        {...register('maxUses')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  {watch('maxUses') && (
                    <Input
                      type="number"
                      placeholder="Max number of uses"
                      min="1"
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleReset}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Share Link'}
                </Button>
              </div>
            </form>
          ) : (
            // Generated Link Display
            <div className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 mb-2">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Share link created!</span>
                </div>
                <p className="text-sm text-green-700">
                  Your project is now accessible via the link below.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Shareable Link
                </label>
                <div className="flex gap-2">
                  <Input
                    value={generatedLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={() => copyToClipboard(generatedLink)}
                    className="flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium mb-2">Share Options</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Access Level:</span>
                    <span className="font-medium capitalize">{accessLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Link Type:</span>
                    <span className="font-medium capitalize">{shareType}</span>
                  </div>
                  {requiresPassword && (
                    <div className="flex justify-between">
                      <span>Password:</span>
                      <span className="font-medium">●●●●●●●●</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => copyToClipboard(generatedLink)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link Again
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleReset}
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
