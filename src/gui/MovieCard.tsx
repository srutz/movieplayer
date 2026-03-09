'use client';

import Image from 'next/image';
import { useTransitionRouter } from 'next-view-transitions';

function formatDuration(seconds: number): string {
  if (seconds === 0) return 'Unknown';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

interface MovieInfo {
  fullPath: string;
  fileName: string;
  accessRights: string;
  lengthSeconds: number;
  thumbnailPath?: string;
}

interface MovieCardProps {
  movie: MovieInfo;
}

export function MovieCard({ movie }: MovieCardProps) {
  const router = useTransitionRouter();

  const handlePlay = () => {
    // Encode the full path to pass as URL parameter
    const encodedPath = encodeURIComponent(movie.fullPath);
    router.push(`/player?movie=${encodedPath}`);
  };

  return (
    <div className="moviecard bg-black rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all group">
      {/* Preview image with play overlay */}
      <div className="w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden relative">
        {movie.thumbnailPath ? (
          <Image
            src={`/api/thumbnail?path=${encodeURIComponent(movie.thumbnailPath)}`}
            alt={movie.fileName}
            fill
            className="object-cover"
          />
        ) : (
          <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <title>No preview available</title>
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        )}

        {/* Play button overlay - shows on group hover */}
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={handlePlay}
            className="w-20 h-20 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all hover:scale-110"
            aria-label="Play movie"
          >
            <svg
              className="w-10 h-10 text-black ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Play</title>
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-2 truncate" title={movie.fileName}>
          {movie.fileName}
        </h3>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">
            {formatDuration(movie.lengthSeconds)}
          </span>
          <span className="text-gray-500 text-xs">
            {movie.accessRights}
          </span>
        </div>
        <p className="text-gray-200 text-xs truncate" title={movie.fullPath}>
          {movie.fullPath}
        </p>
      </div>
    </div>
  );
}
