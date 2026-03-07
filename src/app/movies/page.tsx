import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { MovieCard } from '@/gui/MovieCard';

// Revalidate every 5 minutes as fallback
export const revalidate = 300;

interface MovieInfo {
  fullPath: string;
  fileName: string;
  accessRights: string;
  lengthSeconds: number;
  thumbnailPath?: string;
}

interface ScanResult {
  timeOfScan: string;
  rootPathOfScan: string;
  movies: MovieInfo[];
}



export default async function MoviesPage() {
  console.log(">> Rendering MoviesPage");
  const dbPath = path.join(os.homedir(), '.movieplayer', 'database.json');

  let scanResult: ScanResult | null = null;

  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8');
      scanResult = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading database:', error);
  }

  return (
    <div className="grow bg-zinc-800 flex flex-col">
      {scanResult ? (
        <>
          <p className="px-8 text-gray-400 my-3">
            {scanResult.movies.length} movies found • Last scanned: {new Date(scanResult.timeOfScan).toLocaleString()}
          </p>

          <div className="h-1 grow overflow-y-auto flex flex-col items-center gap-4 mb-2">
            <div className="pt-2 pb-8 px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {scanResult.movies.map((movie) => (
                <MovieCard
                  key={movie.fullPath}
                  movie={movie}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-black rounded-lg shadow-lg p-8 text-center">
          <p className="text-gray-400 mb-4">No movie database found.</p>
          <p className="text-gray-500 text-sm">
            Click "Rescan drive" on the home page to build your movie database.
          </p>
        </div>
      )}
    </div>
  );
}

