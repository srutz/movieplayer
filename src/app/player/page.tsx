'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PlayerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const moviePath = searchParams.get('movie');
  const [movieName, setMovieName] = useState('');

  useEffect(() => {
    if (moviePath) {
      // Extract filename from path
      const parts = moviePath.split('/');
      setMovieName(parts[parts.length - 1]);
    }
  }, [moviePath]);

  if (!moviePath) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-white">
        <p>No movie selected</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-zinc-900">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <title>Back arrow</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-lg font-semibold text-white truncate max-w-2xl" title={movieName}>
          {movieName}
        </h1>
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      {/* Video Player */}
      <div className="h-1 px-2 flex-1 flex justify-center bg-black">
        <video
          controls
          autoPlay
          className="max-w-full max-h-full"
          src={`/api/video?path=${encodeURIComponent(moviePath)}`}
        >
          <track kind="captions" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
