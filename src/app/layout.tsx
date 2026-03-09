import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ViewTransitions } from "next-view-transitions";
import { Menubar } from "@/gui/Menubar";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moviebrowser",
  description: "Browse movies on your localhost",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
        <body
          className={cn(
            `${geistSans.variable} ${geistMono.variable} antialiased`,
            "bg-zinc-900 text-gray-100 w-screen h-screen overflow-hidden flex flex-col",
          )}
        >
          <Menubar></Menubar>
          <div className="h-1 grow overflow-y-auto flex flex-col">
            {children}
          </div>
        </body>
      </html>
    </ViewTransitions>
  );
}

