import { broadcastToRoom } from "../rooms/roomManager";
import { deleteSession } from "../services/sessionService";

export function handleUserLeft(roomId : string, userId: string, userName: string) {

  broadcastToRoom(roomId, {
    type: "user-left",
    user_id: userId,
    user_name: userName
  });

  deleteSession(roomId, userId);

}