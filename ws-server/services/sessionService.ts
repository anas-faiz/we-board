import { db } from "../config/db";

export async function upsertSession(roomId, userId, userName, color) {

  await db.collection("sessions").updateOne(
    { room_id: roomId, user_id: userId },
    {
      $set: {
        room_id: roomId,
        user_id: userId,
        user_name: userName,
        user_color: color,
        created_at: new Date(),
        last_activity: new Date()
      }
    },
    { upsert: true }
  );

}

export async function updateActivity(roomId, userId) {

  await db.collection("sessions").updateOne(
    { room_id: roomId, user_id: userId },
    { $set: { last_activity: new Date() } }
  );

}

export async function deleteSession(roomId, userId) {

  await db.collection("sessions").deleteOne({
    room_id: roomId,
    user_id: userId
  });

}