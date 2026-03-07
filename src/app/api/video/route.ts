import * as fs from 'fs';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import * as path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoPath = searchParams.get('path');

    if (!videoPath) {
      return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
    }

    // Security check: ensure the file exists and is a valid path
    const normalizedPath = path.normalize(videoPath);
    if (!fs.existsSync(normalizedPath)) {
      return NextResponse.json({ error: 'Video file not found' }, { status: 404 });
    }

    const stat = fs.statSync(normalizedPath);
    const fileSize = stat.size;
    const range = request.headers.get('range');

    // Get file extension for content type
    const ext = path.extname(normalizedPath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mkv': 'video/x-matroska',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.wmv': 'video/x-ms-wmv',
      '.flv': 'video/x-flv',
      '.m4v': 'video/mp4',
      '.mpg': 'video/mpeg',
      '.mpeg': 'video/mpeg',
      '.3gp': 'video/3gpp',
      '.ogv': 'video/ogg',
      '.m2ts': 'video/mp2t',
      '.mts': 'video/mp2t',
    };
    const contentType = contentTypeMap[ext] || 'video/mp4';

    // Support range requests for video streaming
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(normalizedPath, { start, end });

      const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Type': contentType,
      };

      return new NextResponse(file as unknown as BodyInit, {
        status: 206,
        headers,
      });
    } else {
      const file = fs.createReadStream(normalizedPath);

      const headers = {
        'Content-Length': fileSize.toString(),
        'Content-Type': contentType,
      };

      return new NextResponse(file as unknown as BodyInit, {
        status: 200,
        headers,
      });
    }
  } catch (error) {
    console.error('Error serving video:', error);
    return NextResponse.json(
      { error: 'Failed to load video' },
      { status: 500 }
    );
  }
}
