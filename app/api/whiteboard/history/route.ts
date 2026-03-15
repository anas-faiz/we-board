import { getDatabase, initializeDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('room_id');
    const limit = parseInt(searchParams.get('limit') || '1000', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!roomId) {
      return NextResponse.json(
        { error: 'room_id is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Get total count
    const total = await db
      .collection('drawing_events')
      .countDocuments({ room_id: roomId });

    // Get events with pagination
    const events = await db
      .collection('drawing_events')
      .find({ room_id: roomId })
      .sort({ timestamp: 1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      events,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error in GET /api/whiteboard/history:', error);
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

    if (!roomId) {
      return NextResponse.json(
        { error: 'room_id is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const result = await db
      .collection('drawing_events')
      .deleteMany({ room_id: roomId });

    return NextResponse.json({
      success: true,
      deleted: result.deletedCount,
    });
  } catch (error) {
    console.error('Error in DELETE /api/whiteboard/history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
