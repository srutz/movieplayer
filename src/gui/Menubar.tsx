import { Link } from 'next-view-transitions'
import { cn } from "@/lib/utils";

export function Menubar() {
  return (
    <div
      className={cn(
        "h-12 w-full border-b border-gray-800 flex gap-4 items-center px-4",
        "text-white",
        "bg-gradient-to-r from-blue-500 to-indigo-600",
      )}
    >
      <h1 className="text-xl text-gray-800 font-semibold uppercase">Moviebrowser</h1>
      <div className="w-8"></div>
      <Link href="/" className="font-semibold hover:underline">
        Home
      </Link>
      <Link href="/movies" className="font-semibold hover:underline">
        Browse
      </Link>
    </div>
  );
}
