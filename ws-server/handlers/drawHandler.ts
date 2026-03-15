import { saveDrawingEvent } from "../services/drawingService";
import { updateActivity } from "../services/sessionService";
import { broadcastToRoom } from "../rooms/roomManager";
import { WSContext } from "../types";

export async function handleDraw(data: any, ctx : WSContext) {

  if (!ctx.roomId) return;

  const event = {

    room_id: ctx.roomId,
    user_id: ctx.userId,
    user_name: ctx.userName,
    user_color: ctx.userColor,
    event_type: "stroke",
    timestamp: Date.now(),
    data: data.data

  };

  await saveDrawingEvent(event);

  await updateActivity(ctx.roomId, ctx.userId);

  broadcastToRoom(ctx.roomId, {
    type: "draw",
    user_id: ctx.userId,
    user_name: ctx.userName,
    user_color: ctx.userColor,
    data: data.data,
    timestamp: event.timestamp
  });

}