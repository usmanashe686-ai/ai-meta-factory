import React from 'react';
import { useCollaboration } from './CollaborationProvider';

export const UserPresence: React.FC = () => {
  const { users, currentUser } = useCollaboration();

  // Helper to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center space-x-1 p-2 bg-gray-800 rounded-lg">
      {users.map(user => (
        <div
          key={user.id}
          className="relative group"
          title={`${user.name}${user.id === currentUser?.id ? ' (you)' : ''}`}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: user.color || '#888' }}
          >
            {getInitials(user.name)}
          </div>
          {user.cursor && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
          )}
        </div>
      ))}
      {users.length === 0 && (
        <span className="text-sm text-gray-400">No other users online</span>
      )}
    </div>
  );
};
