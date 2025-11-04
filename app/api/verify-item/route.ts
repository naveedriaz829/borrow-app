import { NextResponse } from 'next/server';
import { createClient } from 'redis';

let redis: any;
async function getRedis() {
  if (!redis) {
    redis = createClient({ url: process.env.STORAGE_REDIS_URL });
    redis.on('error', (err: any) => console.error('Redis Client Error', err));
    await redis.connect();
  }
  return redis;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  
  if (!key) {
    return NextResponse.json({ error: 'Key parameter is required' }, { status: 400 });
  }

  try {
    const redis = await getRedis();
    const value = await redis.get(key);
    if (value === null) {
      return NextResponse.json({ exists: false });
    }
    return NextResponse.json({ exists: true, value });
  } catch (error) {
    console.error('Error verifying item:', error);
    return NextResponse.json(
      { error: 'Failed to verify item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { key, value } = await request.json();
    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }
    const redis = await getRedis();
    await redis.set(key, value);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: 'Failed to update key' }, { status: 500 });
  }
}

// New endpoint to check Redis connection
export async function POST(request: Request) {
  try {
    const redis = await getRedis();
    const ping = await redis.ping();
    if (ping === 'PONG') {
      return NextResponse.json({ status: 'Redis connection is correct' });
    } else {
      return NextResponse.json({ status: 'Redis connection failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error checking Redis connection:', error);
    return NextResponse.json({ error: 'Failed to check Redis connection' }, { status: 500 });
  }
}
