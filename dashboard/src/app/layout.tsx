import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RealtimeDataProvider } from "@/context/realtime-data-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CarryGreen Dashboard",
  description: "Real-time solar power monitoring dashboard for TwinklePower inverter data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RealtimeDataProvider autoConnect={true} updateInterval={5000}>
          {children}
        </RealtimeDataProvider>
      </body>
    </html>
  );
}
