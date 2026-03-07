import Link from "next/link";
import { cn } from "@/lib/utils";

export function Menubar() {
  return (
    <div
      className={cn(
        "h-12 w-full border-b border-gray-300 flex items-center px-4",
        "text-white",
        "bg-gradient-to-r from-blue-500 to-indigo-600",
      )}
    >
      <h1 className="text-xl font-semibold uppercase bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-300 bg-clip-text text-transparent">
        Moviebrowser
      </h1>
      <div className="w-8"></div>
      <Link href="/" className="font-semibold hover:underline">
        Dashboard
      </Link>
      <Link href="/movies" className="font-semibold hover:underline">
        Dashboard
      </Link>
    </div>
  );
}
