import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { EnterAppOverlay } from "@/components/shell/enter-app-overlay";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "fictus — Social UI Simulation Studio",
  description: "A premium social interface simulation and composition studio.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg text-foreground">
        <TooltipProvider delayDuration={200}>
          {children}
          <CommandPalette />
          <EnterAppOverlay />
        </TooltipProvider>
      </body>
    </html>
  );
}
