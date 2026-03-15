'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Copy, Check } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateRoomId = () => {
    const newRoomId = `room-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
    setRoomId(newRoomId);
  };

  const handleCreateRoom = () => {
    if (!roomId.trim()) {
      generateRoomId();
      return;
    }
    enterRoom();
  };

  const handleJoinRoom = () => {
    if (!roomId.trim()) {
      alert('Please enter a room ID');
      return;
    }
    enterRoom();
  };

  const enterRoom = () => {
    setLoading(true);
    // Small delay for visual feedback
    setTimeout(() => {
      router.push(`/whiteboard/${encodeURIComponent(roomId)}`);
    }, 300);
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="text-indigo-600" size={32} />
            <h1 className="text-4xl font-bold text-gray-900">Whiteboard</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Real-time collaborative drawing
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle>Get Started</CardTitle>
            <CardDescription className="text-blue-100">
              Create a new room or join an existing one
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Room ID Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Room ID
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter or generate a room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleJoinRoom();
                    }
                  }}
                  className="flex-1"
                />
                {roomId && (
                  <button
                    onClick={copyRoomId}
                    className="p-2 rounded hover:bg-gray-100 transition-colors"
                    title="Copy room ID"
                  >
                    {copied ? (
                      <Check size={20} className="text-green-500" />
                    ) : (
                      <Copy size={20} className="text-gray-500" />
                    )}
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Share this ID with others to collaborate
              </p>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={generateRoomId}
                variant="outline"
                className="w-full"
              >
                Generate ID
              </Button>
              <Button
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? 'Entering...' : 'Create Room'}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <Button
              onClick={handleJoinRoom}
              disabled={!roomId.trim() || loading}
              className="w-full"
              variant="default"
            >
              {loading ? 'Joining...' : 'Join Existing Room'}
            </Button>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <p className="text-2xl font-bold text-indigo-600">∞</p>
            <p className="text-xs text-gray-600 mt-1">Unlimited Users</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <p className="text-2xl font-bold text-indigo-600">⚡</p>
            <p className="text-xs text-gray-600 mt-1">Real-time Sync</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <p className="text-2xl font-bold text-indigo-600">💾</p>
            <p className="text-xs text-gray-600 mt-1">Auto-save</p>
          </div>
        </div>
      </div>
    </main>
  );
}
