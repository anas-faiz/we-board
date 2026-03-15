import http from "http";
import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";

import { initMongo, closeMongo } from "../config/db";
import { handleMessage } from "../handlers/messageRouter";
import { handleUserLeft } from "../handlers/leaveHandler";
import { generateRandomColor } from "../utils/color";

const PORT = process.env.WS_PORT || 8080;

const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {

  console.log("[WS] New client connected");

  const userId = uuidv4();
  const userName = `User${userId.slice(0, 8)}`;
  const userColor = generateRandomColor();

  let roomId: string | null = null;

  ws.on("message", async (message) => {

    try {

      const data = JSON.parse(message.toString());

      const newRoom = await handleMessage(ws, data, {
        userId,
        userName,
        userColor,
        roomId
      });

      if (newRoom) roomId = newRoom;

    } catch (error) {
      console.error("[WS] Message error", error);
    }

  });

  ws.on("close", () => {

    if (roomId) {
      handleUserLeft(roomId, userId, userName);
    }

    console.log("[WS] Client disconnected");

  });

  ws.on("error", (err) => {
    console.error("[WS] Error:", err);
  });

});

async function start() {

  try {

    await initMongo();

    server.listen(PORT, () => {
      console.log(`[WS Server] Listening on ${PORT}`);
    });

  } catch (err) {

    console.error("Failed to start", err);
    process.exit(1);

  }

}

start();

process.on("SIGINT", async () => {

  console.log("Shutting down");

  await closeMongo();

  server.close(() => {
    process.exit(0);
  });

});