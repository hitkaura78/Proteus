import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Proteus — Drift-Aware IDS Console",
  description: "Research console for a drift-aware, GAN-augmented intrusion detection system for SDN.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-full min-h-screen bg-surface-0 text-text-primary">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <MobileNav />
          <main className="min-w-0 flex-1 overflow-y-auto bg-surface-0 px-3 py-4 sm:px-5 sm:py-5">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

/*
 * PROTEUS APPLICATION LAYOUT
 *
 * This root layout defines the shared structure used across the application.
 *
 * - Metadata: Sets the browser title and description for the Proteus console.
 * - Fonts: Loads Geist Sans and Geist Mono for consistent typography.
 * - Sidebar: Provides the main navigation for desktop screens.
 * - TopBar: Displays the top-level application header.
 * - MobileNav: Provides navigation optimized for mobile devices.
 * - Main Content: Renders the current page through the children prop.
 * - Styling: Uses Tailwind CSS utility classes for spacing, layout,
 *   background colors, text colors, and responsive behavior.
 * - HTML Configuration: Sets the document language to English and
 *   applies the loaded font variables across the application.
 *
 * Keeping these shared elements in one root layout ensures a consistent
 * interface across pages while allowing individual pages to render their
 * own content inside the main section.
 */
