import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { EnhancedVoiceProvider } from "../lib/enhanced-voice-context";
import { HighlightProvider } from "../lib/highlight-context";
import { Toaster } from "@/components/ui/sonner";
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
  title: "VoiceUI",
  description: "AI-powered voice-controlled user interface with natural language commands",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" }
  ]
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
        <HighlightProvider 
          highlightColor="#1e293b"
          highlightDuration={2000}
          highlightIntensity="medium"
        >
          <EnhancedVoiceProvider debug={true} useAI={true}>
            {children}
          </EnhancedVoiceProvider>
        </HighlightProvider>
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              marginTop: '20px'
            }
          }}
        />
      </body>
    </html>
  );
}
