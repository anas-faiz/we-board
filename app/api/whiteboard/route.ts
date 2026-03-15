import { getDatabase, initializeDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Initialize database if needed
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
    const whiteboard = await db.collection('whiteboards').findOne({ room_id: roomId });

    if (!whiteboard) {
      // Create new whiteboard
      const newWhiteboard = {
        room_id: roomId,
        title: `Whiteboard - ${roomId}`,
        description: '',
        owner_id: 'system',
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true,
      };

      await db.collection('whiteboards').insertOne(newWhiteboard);

      return NextResponse.json({
        success: true,
        whiteboard: newWhiteboard,
        created: true,
      });
    }

    return NextResponse.json({
      success: true,
      whiteboard,
      created: false,
    });
  } catch (error) {
    console.error('Error in GET /api/whiteboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();

    const body = await request.json();
    const { room_id, title, description } = body;

    if (!room_id) {
      return NextResponse.json(
        { error: 'room_id is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const whiteboard = {
      room_id,
      title: title || `Whiteboard - ${room_id}`,
      description: description || '',
      owner_id: 'system',
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true,
    };

    const result = await db.collection('whiteboards').updateOne(
      { room_id },
      { $set: whiteboard },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      whiteboard,
      modified: result.modifiedCount > 0,
    });
  } catch (error) {
    console.error('Error in POST /api/whiteboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
