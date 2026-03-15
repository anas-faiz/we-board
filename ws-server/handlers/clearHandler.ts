import { saveDrawingEvent } from "../services/drawingService";
import { broadcastToRoom } from "../rooms/roomManager";
import { WSContext } from "../types";

export async function handleClear(ctx : WSContext) {

  if (!ctx.roomId) return;

  const event = {

    room_id: ctx.roomId,
    user_id: ctx.userId,
    user_name: ctx.userName,
    event_type: "clear",
    timestamp: Date.now()

  };

  await saveDrawingEvent(event);

  broadcastToRoom(ctx.roomId, {
    type: "clear",
    user_id: ctx.userId,
    user_name: ctx.userName,
    timestamp: event.timestamp
  });

}