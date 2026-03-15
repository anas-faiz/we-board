import { handleJoin } from "./joinHandler";
import { handleDraw } from "./drawHandler";
import { handleShape } from "./shapeHandler";
import { handleClear } from "./clearHandler";
import { handleSyncRequest } from "./syncHandler";
import { WSContext } from "../types";

export async function handleMessage(ws, data: any  , ctx: WSContext) {

  switch (data.type) {

    case "join":
      return handleJoin(ws, data, ctx);

    case "draw":
      return handleDraw(data, ctx);

    case "shape":
      return handleShape(data, ctx);

    case "clear":
      return handleClear(ctx);

    case "cursor":
      return null;

    case "sync-request":
      return handleSyncRequest(ws, data, ctx);

    default:
      console.log("Unknown message type:", data.type);

  }

}