import { db } from "../config/db";

export async function saveDrawingEvent(event) {

  await db.collection("drawing_events").insertOne(event);

}

export async function getRoomEvents(roomId) {

  return db
    .collection("drawing_events")
    .find({ room_id: roomId })
    .sort({ timestamp: 1 })
    .toArray();

}

export async function getEventsAfter(roomId, timestamp) {

  return db
    .collection("drawing_events")
    .find({
      room_id: roomId,
      timestamp: { $gt: timestamp }
    })
    .sort({ timestamp: 1 })
    .toArray();

}