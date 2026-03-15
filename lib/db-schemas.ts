import { ObjectId } from 'mongodb';

// Whiteboard document schema
export interface Whiteboard {
  _id?: ObjectId;
  room_id: string;
  title: string;
  description?: string;
  owner_id: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

// Drawing event schema (each stroke/action)
export interface DrawingEvent {
  _id?: ObjectId;
  room_id: string;
  user_id: string;
  user_name: string;
  user_color: string;
  event_type: 'stroke' | 'clear' | 'undo';
  timestamp: number;
  data?: {
    points?: Array<{ x: number; y: number }>;
    color?: string;
    size?: number;
    opacity?: number;
  };
}

// Session schema (tracks active users)
export interface Session {
  _id?: ObjectId;
  room_id: string;
  user_id: string;
  user_name: string;
  user_color: string;
  created_at: Date;
  last_activity: Date;
  cursor_position?: {
    x: number;
    y: number;
  };
}

// Snapshot schema (periodic snapshots for recovery)
export interface DrawingSnapshot {
  _id?: ObjectId;
  room_id: string;
  snapshot_data: string; // Base64 encoded canvas data
  event_count: number;
  created_at: Date;
}
