import { MainButtonBar } from "@/gui/MainButtonBar";

export default function Home() {
  return (
    <div className="h-1 grow flex flex-col items-center justify-center bg-black">
      <h1 className="text-9xl font-black uppercase tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent">
        Movieplayer
      </h1>
      <p className="mt-6 text-xl text-gray-400">Your movie collection</p>
      <MainButtonBar />
    </div>
  );
}
