import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { NextResponse } from 'next/server';
import { scanDirectory } from '@/tools/scanner';



export async function POST() {
  try {
    const moviePath = process.env.MOVIE_PATH || path.join(os.homedir(), 'Videos');
    const scanResult = scanDirectory(moviePath);

    // Create ~/.movieplayer directory if it doesn't exist
    const dbDir = path.join(os.homedir(), '.movieplayer');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Write database.json
    const dbPath = path.join(dbDir, 'database.json');
    fs.writeFileSync(dbPath, JSON.stringify(scanResult, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: `Scan complete. Found ${scanResult.movies.length} movies.`,
      databasePath: dbPath,
      movieCount: scanResult.movies.length,
      scanTime: scanResult.timeOfScan,
      rootPath: scanResult.rootPathOfScan
    });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
