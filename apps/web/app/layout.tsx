import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

import { Sidebar, TopNav } from "@repo/ui";

export const metadata: Metadata = {
  title: "Cendronyx Prep",
  description: "Advanced preparation for FBISE exams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-bg-dark text-text-dark`}>
        <div className="print:hidden">
          <Sidebar />
          <TopNav />
        </div>
        <main className="ml-64 pt-20 h-screen overflow-y-auto print:ml-0 print:pt-0 print:h-auto print:overflow-visible">
          {children}
        </main>
      </body>
    </html>
  );
}
