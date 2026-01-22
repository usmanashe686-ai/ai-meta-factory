import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageSquare, 
  Users, 
  Bell, 
  PenTool,
  X,
  PlusCircle,
  Eye,
  EyeOff,
  Filter,
  CheckCircle
} from 'lucide-react';
import { RichTextEditor } from './comments/RichTextEditor';
import { useCommentStore } from '@/store/comment-store';
import { usePermissionStore } from '@/store/permission-store';
import { useActivityStore, ActivityType } from '@/store/activity-store';
import { useAnnotationStore } from '@/store/annotation-store';
import toast from 'react-hot-toast';

interface CollaborationSidebarProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  componentId?: string;
  position?: { x: number; y: number };
}

type SidebarTab = 'comments' | 'permissions' | 'activity' | 'annotations';

export const CollaborationSidebar: React.FC<CollaborationSidebarProps> = ({
  projectId,
  isOpen,
  onClose,
  componentId,
  position
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('comments');
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [activityFilter, setActivityFilter] = useState<ActivityType | 'all'>('all');
  
  const { createThread, threads, getComponentComments, resolveThread } = useCommentStore();
  const { can, currentUserRole, getProjectUsers } = usePermissionStore();
  const { addActivity, getProjectActivities, markAsRead } = useActivityStore();
  const { setSelectedTool, selectedTool, setColor, color, setStrokeWidth, strokeWidth } = useAnnotationStore();
  
  const componentComments = componentId ? getComponentComments(componentId) : [];
  const activities = getProjectActivities(projectId);
  const projectUsers = getProjectUsers(projectId);
  
  const handleAddComment = async (content: string) => {
    if (!can('add_comments')) {
      toast.error('You do not have permission to add comments');
      return;
    }
    
    const threadId = createThread({
      projectId,
      componentId,
      x: position?.x || 0,
      y: position?.y || 0,
      resolved: false,
      participants: ['current-user']
    });
    
    const commentStore = useCommentStore.getState();
    commentStore.addComment({
      projectId,
      componentId,
      threadId,
      content,
      author: {
        id: 'current-user-id',
        name: 'Current User',
        avatar: 'https://i.pravatar.cc/150?img=4'
      },
      resolved: false,
      mentions: extractMentions(content)
    });
    
    addActivity({
      projectId,
      type: 'comment_added',
      userId: 'current-user-id',
      userName: 'Current User',
      data: {
        componentId,
        details: 'Added a comment'
      }
    });
    
    toast.success('Comment added');
  };
  
  const handleResolveThread = (threadId: string) => {
    resolveThread(threadId);
    addActivity({
      projectId,
      type: 'comment_resolved',
      userId: 'current-user-id',
      userName: 'Current User',
      data: {}
    });
    toast.success('Thread resolved');
  };
  
  const extractMentions = (content: string): string[] => {
    const mentions: string[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const mentionElements = doc.querySelectorAll('.mention');
    
    mentionElements.forEach((el) => {
      const userId = el.getAttribute('data-id');
      if (userId) mentions.push(userId);
    });
    
    return mentions;
  };
  
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'component_added': return '🛠️';
      case 'component_updated': return '✏️';
      case 'component_removed': return '🗑️';
      case 'comment_added': return '💬';
      case 'comment_resolved': return '✅';
      case 'user_joined': return '👤';
      case 'permission_changed': return '🔑';
      default: return '📝';
    }
  };
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'commenter': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const annotationTools = [
    { id: 'pen', icon: '🖊️', label: 'Pen' },
    { id: 'rectangle', icon: '⬜', label: 'Rectangle' },
    { id: 'circle', icon: '⭕', label: 'Circle' },
    { id: 'arrow', icon: '➡️', label: 'Arrow' },
    { id: 'text', icon: '📝', label: 'Text' },
  ] as const;
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l shadow-xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold">Collaboration Tools</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex-1 py-3 text-center ${activeTab === 'comments' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          <MessageSquare className="inline w-4 h-4 mr-2" />
          Comments
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex-1 py-3 text-center ${activeTab === 'permissions' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          <Users className="inline w-4 h-4 mr-2" />
          Team
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 py-3 text-center ${activeTab === 'activity' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          <Bell className="inline w-4 h-4 mr-2" />
          Activity
        </button>
        <button
          onClick={() => setActiveTab('annotations')}
          className={`flex-1 py-3 text-center ${activeTab === 'annotations' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          <PenTool className="inline w-4 h-4 mr-2" />
          Draw
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Add Comment</h3>
              <RichTextEditor
                onSubmit={handleAddComment}
                placeholder="Add a comment... Use @ to mention someone"
                autoFocus={false}
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Recent Comments</h3>
                <span className="text-sm text-gray-500">
                  {componentId ? `${componentComments.length} on this component` : `${threads.length} total`}
                </span>
              </div>
              
              {componentId ? (
                componentComments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No comments on this component</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {componentComments.slice(0, 5).map((comment) => (
                      <div key={comment.id} className="p-3 border rounded-lg">
                        <div className="flex items-start gap-2">
                          <img
                            src={comment.author.avatar || 'https://i.pravatar.cc/150?img=4'}
                            alt={comment.author.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{comment.author.name}</span>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <div 
                              className="mt-1 text-sm prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: comment.content }}
                            />
                            {comment.resolved && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                                <CheckCircle className="w-3 h-3" />
                                <span>Resolved</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Select a component to see its comments</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Your Role</h3>
              <div className={`inline-block px-3 py-1 rounded-full text-sm ${getRoleColor(currentUserRole || 'editor')}`}>
                {currentUserRole?.toUpperCase() || 'EDITOR'}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {currentUserRole === 'viewer' && 'You can only view this project'}
                {currentUserRole === 'commenter' && 'You can view and add comments'}
                {currentUserRole === 'editor' && 'You can edit and add comments'}
                {currentUserRole === 'admin' && 'You have full access including user management'}
                {currentUserRole === 'owner' && 'You are the project owner with full control'}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Team Members</h3>
              {projectUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No team members yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projectUsers.map((permission) => {
                    const user = {
                      id: permission.userId,
                      name: `User ${permission.userId.slice(-4)}`,
                      avatar: `https://i.pravatar.cc/150?u=${permission.userId}`
                    };
                    
                    return (
                      <div key={permission.userId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-gray-500">{permission.role}</div>
                          </div>
                        </div>
                        <div className={`px-2 py-1 text-xs rounded-full ${getRoleColor(permission.role)}`}>
                          {permission.role}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {can('manage_users') && (
              <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                <Users className="inline w-4 h-4 mr-2" />
                Manage Team
              </button>
            )}
          </div>
        )}
        
        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Recent Activity</h3>
              <div className="flex items-center gap-2">
                <select
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value as ActivityType | 'all')}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="all">All Activities</option>
                  <option value="comment_added">Comments</option>
                  <option value="component_added">Components</option>
                  <option value="user_joined">Users</option>
                </select>
              </div>
            </div>
            
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No activities yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities
                  .filter(activity => activityFilter === 'all' || activity.type === activityFilter)
                  .slice(0, 10)
                  .map((activity) => (
                    <div
                      key={activity.id}
                      className={`p-3 border rounded-lg cursor-pointer ${!activity.read ? 'bg-blue-50 border-blue-200' : ''}`}
                      onClick={() => markAsRead(activity.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-xl">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{activity.userName}</span>
                            <span className="text-sm text-gray-600">
                              {activity.type === 'component_added' && 'added a component'}
                              {activity.type === 'comment_added' && 'added a comment'}
                              {activity.type === 'user_joined' && 'joined the project'}
                              {activity.type === 'permission_changed' && 'changed permissions'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                            </span>
                            {!activity.read && (
                              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            
            <button className="w-full py-2 text-sm text-blue-600 hover:text-blue-800">
              Load More Activities
            </button>
          </div>
        )}
        
        {/* Annotations Tab */}
        {activeTab === 'annotations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Drawing Tools</h3>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showAnnotations}
                  onChange={(e) => setShowAnnotations(e.target.checked)}
                  className="rounded"
                />
                {showAnnotations ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>Show Annotations</span>
              </label>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Tool Selection</h4>
              <div className="grid grid-cols-3 gap-2">
                {annotationTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id as any)}
                    className={`p-3 border rounded-lg text-center ${selectedTool === tool.id ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'}`}
                  >
                    <div className="text-2xl mb-1">{tool.icon}</div>
                    <div className="text-xs">{tool.label}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Color</h4>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 cursor-pointer rounded border"
              />
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Stroke Width: {strokeWidth}px</h4>
              <input
                type="range"
                min="1"
                max="10"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <button className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Save Annotations
              </button>
              <button className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Clear All
              </button>
            </div>
            
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-1">Instructions</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Select a tool from above</li>
                <li>• Click and drag on canvas to draw</li>
                <li>• Change color and stroke width</li>
                <li>• Toggle visibility with eye icon</li>
                <li>• Save to share with team</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <span className="font-medium">Project:</span> {projectId.slice(0, 8)}...
          </div>
          <div className="flex items-center gap-2">
            {componentId && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                Component Selected
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
