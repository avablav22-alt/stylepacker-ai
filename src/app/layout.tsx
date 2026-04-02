import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "StylePacker AI — Smart Vacation Outfit Curator",
  description: "AI-powered vacation outfit planning for people who struggle with packing. Get personalized capsule wardrobes based on your style, destination, and itinerary.",
  openGraph: {
    title: "StylePacker AI",
    description: "AI-powered vacation outfit curator",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-white text-gray-900 antialiased" style={{ fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
