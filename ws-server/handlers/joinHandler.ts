import { joinRoom, broadcastToRoom } from "../rooms/roomManager";
import { getRoomEvents } from "../services/drawingService";
import { upsertSession } from "../services/sessionService";
import { WSContext } from "../types";

export async function handleJoin(ws, data: any,  ctx: WSContext) {

  const roomId = data.room_id;
  const clientUserName = data.user_name || ctx.userName;

  joinRoom(roomId, ws);

  await upsertSession(roomId, ctx.userId, clientUserName, ctx.userColor);

  const events = await getRoomEvents(roomId);

  ws.send(JSON.stringify({
    type: "join-success",
    user_id: ctx.userId,
    user_name: clientUserName,
    user_color: ctx.userColor,
    room_id: roomId,
    events
  }));

  broadcastToRoom(roomId, {
    type: "user-joined",
    user_id: ctx.userId,
    user_name: clientUserName,
    user_color: ctx.userColor
  }, ws);

  return roomId;

}