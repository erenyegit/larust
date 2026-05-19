import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers";
import { WalletSession } from "@/components/wallet-session";
import { LarustMark } from "@/components/brand/larust-mark";
import { NavLink } from "@/components/nav-link";
import Link from "next/link";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Larust",
  description: "Feedback that lasts. Evidence that proves.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 text-slate-900">
        <AppProviders>
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3">
              <Link href="/" className="inline-flex">
                <LarustMark />
              </Link>
              <nav className="hidden items-center gap-1 text-sm md:flex">
                <NavLink href="/create">Create</NavLink>
                <NavLink href="/dashboard">Dashboard</NavLink>
              </nav>
              <WalletSession />
            </div>
          </header>
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
