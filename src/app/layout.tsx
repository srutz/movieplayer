import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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
    <html lang="en">
      <body
        className={cn(`${geistSans.variable} ${geistMono.variable} antialiased`,
          "bg-red-300 w-screen h-screen overflow-hidden flex flex-col"
        )}
      >
        <Menubar></Menubar>
        <div className="h-1 grow overflow-y-auto">
          {children}
        </div>
      </body>
    </html>
  );
}
