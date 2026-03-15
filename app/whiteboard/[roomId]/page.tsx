'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CanvasDrawer } from '@/components/canvas-drawer';
import { DrawingToolbar } from '@/components/drawing-toolbar';
import { UsersPanel } from '@/components/users-panel';
import { useWhiteboardWs, DrawingEvent } from '@/hooks/use-whiteboard-ws';
import { Wifi, WifiOff } from 'lucide-react';

export default function WhiteboardPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [opacity, setOpacity] = useState(1);
  const [drawingTool, setDrawingTool] = useState<'pen' | 'rectangle' | 'circle' | 'line'>('pen');
  const [drawEvents, setDrawEvents] = useState<DrawingEvent[]>([]);
  const [userName, setUserName] = useState(`User${Math.random().toString(36).slice(2, 9)}`);

  const {
    isConnected,
    userId,
    userColor,
    users,
    sendDraw,
    sendShape,
    sendClear,
    requestSync,
    sendCursorPosition,
  } = useWhiteboardWs({
    roomId,
    userName,
    onEventReceived: (event) => {
      setDrawEvents((prev) => [...prev, event]);
    },
    onUsersChanged: (updatedUsers) => {
      // Users list is already managed by the hook
    },
  });

  const handleDraw = useCallback(
    (stroke) => {
      sendDraw(stroke.points, stroke.color, stroke.size, stroke.opacity);
    },
    [sendDraw]
  );

  const handleShape = useCallback(
    (shape) => {
      sendShape(shape.type, shape.startX, shape.startY, shape.endX, shape.endY, shape.color, shape.size, shape.opacity);
    },
    [sendShape]
  );

  const handleClear = useCallback(() => {
    sendClear();
  }, [sendClear]);

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      sendCursorPosition(x, y);
    },
    [sendCursorPosition]
  );

  useEffect(() => {
    // Periodically request sync to catch any missed events
    const syncInterval = setInterval(() => {
      requestSync();
    }, 5000);

    return () => clearInterval(syncInterval);
  }, [requestSync]);

  return (
    <main className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Collaborative Whiteboard
            </h1>
            <div className="flex items-center gap-2 ml-4">
              {isConnected ? (
                <>
                  <Wifi size={18} className="text-green-500" />
                  <span className="text-sm text-green-600 font-medium">
                    Connected
                  </span>
                </>
              ) : (
                <>
                  <WifiOff size={18} className="text-red-500" />
                  <span className="text-sm text-red-600 font-medium">
                    Disconnected
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Room ID: <code className="bg-gray-100 px-2 py-1 rounded">{roomId}</code>
          </div>
        </header>

        {/* Toolbar */}
        <DrawingToolbar
          color={color}
          brushSize={brushSize}
          opacity={opacity}
          drawingTool={drawingTool}
          onColorChange={setColor}
          onBrushSizeChange={setBrushSize}
          onOpacityChange={setOpacity}
          onToolChange={setDrawingTool}
        />

        {/* Canvas Area */}
        <div className="flex-1 overflow-hidden">
          <CanvasDrawer
            onDraw={handleDraw}
            onShape={handleShape}
            onClear={handleClear}
            color={color}
            brushSize={brushSize}
            opacity={opacity}
            drawingTool={drawingTool}
            drawEvents={drawEvents}
          />
        </div>
      </div>

      {/* Users Panel */}
      <UsersPanel
        users={users}
        currentUserId={userId}
        currentUserName={userName}
        currentUserColor={userColor}
      />
    </main>
  );
}
