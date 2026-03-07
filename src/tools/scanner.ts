import * as fs from 'fs';
import * as path from 'path';

interface MovieInfo {
  fullPath: string;
  fileName: string;
  accessRights: string;
  lengthSeconds: number;
}

interface ScanResult {
  timeOfScan: string;
  rootPathOfScan: string;
  movies: MovieInfo[];
}

const MOVIE_EXTENSIONS = [
  '.mp4', '.avi', '.mkv', '.mov', '.wmv',
  '.flv', '.webm', '.m4v', '.mpg', '.mpeg',
  '.3gp', '.ogv', '.ts', '.m2ts'
];

function isMovieFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return MOVIE_EXTENSIONS.includes(ext);
}

function getAccessRights(stats: fs.Stats): string {
  const mode = stats.mode;
  const rights = [];

  // Owner permissions
  rights.push((mode & 0o400) ? 'r' : '-');
  rights.push((mode & 0o200) ? 'w' : '-');
  rights.push((mode & 0o100) ? 'x' : '-');

  // Group permissions
  rights.push((mode & 0o040) ? 'r' : '-');
  rights.push((mode & 0o020) ? 'w' : '-');
  rights.push((mode & 0o010) ? 'x' : '-');

  // Other permissions
  rights.push((mode & 0o004) ? 'r' : '-');
  rights.push((mode & 0o002) ? 'w' : '-');
  rights.push((mode & 0o001) ? 'x' : '-');

  return rights.join('');
}

function traverseDirectory(
  dirPath: string,
  movies: MovieInfo[],
  visitedInodes: Set<number>
): void {
  try {
    const stats = fs.statSync(dirPath);

    // Check for cycles using inode
    if (visitedInodes.has(stats.ino)) {
      console.error(`Cycle detected: ${dirPath} (inode: ${stats.ino})`);
      return;
    }

    visitedInodes.add(stats.ino);

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      try {
        if (entry.isDirectory()) {
          traverseDirectory(fullPath, movies, visitedInodes);
        } else if (entry.isFile() && isMovieFile(entry.name)) {
          const stats = fs.statSync(fullPath);

          const movieInfo: MovieInfo = {
            fullPath,
            fileName: entry.name,
            accessRights: getAccessRights(stats),
            lengthSeconds: 0 // Would require ffprobe/ffmpeg to get actual length
          };

          movies.push(movieInfo);
        }
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error);
      }
    }
  } catch (error) {
    console.error(`Error accessing ${dirPath}:`, error);
  }
}

export function scanDirectory(rootPath: string): ScanResult {
  const movies: MovieInfo[] = [];
  const visitedInodes = new Set<number>();

  traverseDirectory(rootPath, movies, visitedInodes);

  return {
    timeOfScan: new Date().toISOString(),
    rootPathOfScan: rootPath,
    movies
  };
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: ts-node scanner.ts <directory-path>');
    process.exit(1);
  }

  const scanPath = args[0];

  if (!fs.existsSync(scanPath)) {
    console.error(`Error: Directory '${scanPath}' does not exist`);
    process.exit(1);
  }

  if (!fs.statSync(scanPath).isDirectory()) {
    console.error(`Error: '${scanPath}' is not a directory`);
    process.exit(1);
  }

  const result = scanDirectory(scanPath);
  console.log(JSON.stringify(result, null, 2));
}

