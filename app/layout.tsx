import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/components/auth-provider";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gem Tracker ERP",
  description: "Collaborative gem inventory management",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "antialiased min-h-screen")}>
        <div className="shapes-container">
          <div className="gem shape-1">
            <div className="gem__face gem__face--1"></div>
            <div className="gem__face gem__face--2"></div>
            <div className="gem__face gem__face--3"></div>
            <div className="gem__face gem__face--4"></div>
            <div className="gem__face gem__face--5"></div>
            <div className="gem__face gem__face--6"></div>
            <div className="gem__face gem__face--7"></div>
            <div className="gem__face gem__face--8"></div>
          </div>
          <div className="gem shape-2">
            <div className="gem__face gem__face--1"></div>
            <div className="gem__face gem__face--2"></div>
            <div className="gem__face gem__face--3"></div>
            <div className="gem__face gem__face--4"></div>
            <div className="gem__face gem__face--5"></div>
            <div className="gem__face gem__face--6"></div>
            <div className="gem__face gem__face--7"></div>
            <div className="gem__face gem__face--8"></div>
          </div>
          <div className="gem shape-3">
            <div className="gem__face gem__face--1"></div>
            <div className="gem__face gem__face--2"></div>
            <div className="gem__face gem__face--3"></div>
            <div className="gem__face gem__face--4"></div>
            <div className="gem__face gem__face--5"></div>
            <div className="gem__face gem__face--6"></div>
            <div className="gem__face gem__face--7"></div>
            <div className="gem__face gem__face--8"></div>
          </div>
          <div className="gem shape-4">
            <div className="gem__face gem__face--1"></div>
            <div className="gem__face gem__face--2"></div>
            <div className="gem__face gem__face--3"></div>
            <div className="gem__face gem__face--4"></div>
            <div className="gem__face gem__face--5"></div>
            <div className="gem__face gem__face--6"></div>
            <div className="gem__face gem__face--7"></div>
            <div className="gem__face gem__face--8"></div>
          </div>
        </div>
        <AuthProvider>
          <main className="mx-auto max-w-md md:max-w-2xl lg:max-w-7xl min-h-screen overflow-hidden">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
