export interface WSContext {
  userId: string;
  userName: string;
  userColor: string;
  roomId: string | null;
}

export type ClientMessage =
  | JoinMessage
  | DrawMessage
  | ShapeMessage
  | ClearMessage
  | CursorMessage
  | SyncRequestMessage;

export interface JoinMessage {
  type: "join";
  room_id: string;
  user_name?: string;
}

export interface DrawMessage {
  type: "draw";
  data: any;
}

export interface ShapeMessage {
  type: "shape";
  data: any;
}

export interface ClearMessage {
  type: "clear";
}

export interface CursorMessage {
  type: "cursor";
  position: {
    x: number;
    y: number;
  };
}

export interface SyncRequestMessage {
  type: "sync-request";
  from_timestamp?: number;
}

export interface DrawingEvent {

  room_id: string;

  user_id: string;

  user_name: string;

  user_color?: string;

  event_type: "stroke" | "shape" | "clear";

  timestamp: number;

  data?: any;

}