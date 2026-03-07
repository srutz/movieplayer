import * as fs from 'fs';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import * as path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const thumbnailPath = searchParams.get('path');

    if (!thumbnailPath) {
      return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
    }

    // Security check: ensure the path is within .movieplayer/thumbs directory
    const normalizedPath = path.normalize(thumbnailPath);
    if (!normalizedPath.includes('.movieplayer/thumbs')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
    }

    if (!fs.existsSync(thumbnailPath)) {
      return NextResponse.json({ error: 'Thumbnail not found' }, { status: 404 });
    }

    const imageBuffer = fs.readFileSync(thumbnailPath);

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving thumbnail:', error);
    return NextResponse.json(
      { error: 'Failed to load thumbnail' },
      { status: 500 }
    );
  }
}
