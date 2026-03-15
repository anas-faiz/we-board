import { WebSocket } from "ws";
import { getEventsAfter } from "../services/drawingService";
import { WSContext } from "../types";

export async function handleSyncRequest(
  ws: WebSocket,
  data: any,
  ctx: WSContext
) {
  if (!ctx.roomId) return;

  const events = await getEventsAfter(ctx.roomId, data.from_timestamp || 0);

  ws.send(
    JSON.stringify({
      type: "sync-response",
      events,
    })
  );
}