import { saveDrawingEvent } from "../services/drawingService";
import { updateActivity } from "../services/sessionService";
import { broadcastToRoom } from "../rooms/roomManager";
import { WSContext } from "../types";

export async function handleShape(data: any, ctx: WSContext) {

  if (!ctx.roomId) return;

  const event = {

    room_id: ctx.roomId,
    user_id: ctx.userId,
    user_name: ctx.userName,
    user_color: ctx.userColor,
    event_type: "shape",
    timestamp: Date.now(),
    data: data.data

  };

  await saveDrawingEvent(event);

  await updateActivity(ctx.roomId, ctx.userId);

  broadcastToRoom(ctx.roomId, {
    type: "shape",
    user_id: ctx.userId,
    user_name: ctx.userName,
    user_color: ctx.userColor,
    data: data.data,
    timestamp: event.timestamp
  });

}