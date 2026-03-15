'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

export interface DrawingEvent {
  type: string;
  data?: any;
  user_id?: string;
  user_name?: string;
  user_color?: string;
  timestamp?: number;
}

export interface User {
  id: string;
  name: string;
  color: string;
}

interface UseWhiteboardWsOptions {
  roomId: string;
  userName?: string;
  wsUrl?: string;
  onEventReceived?: (event: DrawingEvent) => void;
  onUsersChanged?: (users: User[]) => void;
}

export function useWhiteboardWs({
  roomId,
  userName = `User${Math.random().toString(36).slice(2, 9)}`,
  wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080',
  onEventReceived,
  onUsersChanged,
}: UseWhiteboardWsOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [userColor, setUserColor] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState(0);

  // Connect to WebSocket
  useEffect(() => {
    const connect = () => {
      try {
        console.log('[WS Hook] Connecting to', wsUrl);
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('[WS Hook] Connected');
          setIsConnected(true);

          // Join room
          ws.send(JSON.stringify({
            type: 'join',
            room_id: roomId,
            user_name: userName,
          }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleMessage(data, ws);
          } catch (error) {
            console.error('[WS Hook] Error parsing message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('[WS Hook] WebSocket error:', error);
          setIsConnected(false);
        };

        ws.onclose = () => {
          console.log('[WS Hook] Disconnected');
          setIsConnected(false);

          // Attempt to reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[WS Hook] Attempting to reconnect...');
            connect();
          }, 3000);
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('[WS Hook] Connection error:', error);
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [roomId, userName, wsUrl]);

  const handleMessage = useCallback((data: any, ws: WebSocket) => {
    switch (data.type) {
      case 'join-success':
        setUserId(data.user_id);
        setUserColor(data.user_color);
        setLastSyncTimestamp(Date.now());

        // Process initial events
        if (data.events && Array.isArray(data.events)) {
          data.events.forEach((event: DrawingEvent) => {
            onEventReceived?.(event);
          });
        }

        console.log('[WS Hook] Joined room successfully');
        break;

      case 'draw':
      case 'shape':
      case 'clear':
        onEventReceived?.(data);
        break;

      case 'user-joined':
        setUsers((prev) => [
          ...prev,
          {
            id: data.user_id,
            name: data.user_name,
            color: data.user_color,
          },
        ]);
        onUsersChanged?.([
          ...users,
          {
            id: data.user_id,
            name: data.user_name,
            color: data.user_color,
          },
        ]);
        console.log('[WS Hook] User joined:', data.user_name);
        break;

      case 'user-left':
        setUsers((prev) => prev.filter((u) => u.id !== data.user_id));
        onUsersChanged?.((prev) =>
          users.filter((u) => u.id !== data.user_id)
        );
        console.log('[WS Hook] User left:', data.user_name);
        break;

      case 'sync-response':
        if (data.events && Array.isArray(data.events)) {
          data.events.forEach((event: DrawingEvent) => {
            onEventReceived?.(event);
          });
        }
        break;

      case 'cursor':
        // Handle cursor position updates if needed
        break;
    }
  }, [onEventReceived, onUsersChanged, users]);

  const sendDraw = useCallback(
    (points: Array<{ x: number; y: number }>, color: string, size: number, opacity: number) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'draw',
            room_id: roomId,
            data: { points, color, size, opacity },
          })
        );
      }
    },
    [roomId]
  );

  const sendShape = useCallback(
    (shapeType: 'rectangle' | 'circle' | 'line', startX: number, startY: number, endX: number, endY: number, color: string, size: number, opacity: number) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'shape',
            room_id: roomId,
            data: { shapeType, startX, startY, endX, endY, color, size, opacity },
          })
        );
      }
    },
    [roomId]
  );

  const sendClear = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'clear',
          room_id: roomId,
        })
      );
    }
  }, [roomId]);

  const requestSync = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'sync-request',
          room_id: roomId,
          from_timestamp: lastSyncTimestamp,
        })
      );
    }
  }, [roomId, lastSyncTimestamp]);

  const sendCursorPosition = useCallback((x: number, y: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'cursor',
          room_id: roomId,
          position: { x, y },
        })
      );
    }
  }, [roomId]);

  return {
    isConnected,
    userId,
    userColor,
    users,
    sendDraw,
    sendShape,
    sendClear,
    requestSync,
    sendCursorPosition,
  };
}
