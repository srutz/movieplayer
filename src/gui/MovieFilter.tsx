"use client";

import { useTransitionRouter } from "next-view-transitions";

export function MovieFilter() {
  const router = useTransitionRouter();
  return (<div className="flex gap-4 items-baseline mb-4">
    <label htmlFor="search" className="text-gray-400">Search:</label>
    <input
      id="search"
      type="text"
      placeholder="Search movies..."
      className="w-80 bg-gray-700 text-white rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
      onChange={(e) => {
        const filter = e.target.value;
        // change search params without reloading the page
        router.push(`/movies?search=${encodeURIComponent(filter)}`, { scroll: false });
      }}
    />
  </div>
  );
}

