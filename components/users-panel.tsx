'use client';

import { Users } from 'lucide-react';

interface User {
  id: string;
  name: string;
  color: string;
}

interface UsersPanelProps {
  users: User[];
  currentUserId: string;
  currentUserName: string;
  currentUserColor: string;
}

export function UsersPanel({
  users,
  currentUserId,
  currentUserName,
  currentUserColor,
}: UsersPanelProps) {
  const allUsers = currentUserId ? [{ id: currentUserId, name: currentUserName, color: currentUserColor }, ...users] : users;

  // Remove duplicates based on user ID
  const uniqueUsers = Array.from(
    new Map(allUsers.map((u) => [u.id, u])).values()
  );

  return (
    <div className="w-64 bg-white border-l border-gray-200 p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Users size={20} />
        <h3 className="font-semibold text-gray-800">
          Active Users ({uniqueUsers.length})
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {uniqueUsers.length === 0 ? (
          <p className="text-sm text-gray-500">No users connected</p>
        ) : (
          uniqueUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: user.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user.name}
                </p>
                {user.id === currentUserId && (
                  <p className="text-xs text-gray-500">(You)</p>
                )}
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400" />
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
        <p>Real-time collaboration enabled</p>
      </div>
    </div>
  );
}
