import { getDatabase, initializeDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('room_id');

    if (!roomId) {
      return NextResponse.json(
        { error: 'room_id is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Get active sessions (last activity within 30 seconds)
    const thirtySecondsAgo = new Date(Date.now() - 30000);
    const sessions = await db
      .collection('sessions')
      .find({
        room_id: roomId,
        last_activity: { $gte: thirtySecondsAgo },
      })
      .toArray();

    return NextResponse.json({
      success: true,
      sessions,
      count: sessions.length,
    });
  } catch (error) {
    console.error('Error in GET /api/whiteboard/sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await initializeDatabase();

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('room_id');
    const userId = searchParams.get('user_id');

    if (!roomId || !userId) {
      return NextResponse.json(
        { error: 'room_id and user_id are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const result = await db
      .collection('sessions')
      .deleteOne({ room_id: roomId, user_id: userId });

    return NextResponse.json({
      success: true,
      deleted: result.deletedCount > 0,
    });
  } catch (error) {
    console.error('Error in DELETE /api/whiteboard/sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
