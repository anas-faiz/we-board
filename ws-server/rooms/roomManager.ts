const rooms = new Map<string, Set<any>>();

export function joinRoom(roomId, ws) {

  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }

  rooms.get(roomId)!.add(ws);

}

export function leaveRoom(roomId, ws) {

  const clients = rooms.get(roomId);

  if (!clients) return;

  clients.delete(ws);

  if (clients.size === 0) {
    rooms.delete(roomId);
  }

}

export function broadcastToRoom(roomId, message, excludeWs = null) {

  if (!rooms.has(roomId)) return;

  const clients = rooms.get(roomId)!;

  const msg = JSON.stringify(message);

  clients.forEach((client) => {

    if (client !== excludeWs && client.readyState === 1) {
      client.send(msg);
    }

  });

}