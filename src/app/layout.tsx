import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/providers";
import { SecurityShield } from "@/components/security/SecurityShield";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0f",
};

export const metadata: Metadata = {
  title: "PRAXIS - AI Prompt Engineering Platform",
  description: "Transform any rough idea into a perfectly crafted prompt. Visual tools, intelligent suggestions, and workflow automation for the modern AI era.",
  keywords: ["prompt engineering", "AI", "prompt builder", "ChatGPT", "Claude", "Gemini", "GPT-4", "prompt optimization"],
  authors: [{ name: "PRAXIS" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16.svg", sizes: "16x16", type: "image/svg+xml" },
      { url: "/favicon-32.svg", sizes: "32x32", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "PRAXIS - Master the Art of Prompt Engineering",
    description: "Transform any rough idea into a perfectly crafted prompt that gets you exactly what you want from AI.",
    type: "website",
    locale: "en_US",
    siteName: "PRAXIS",
  },
  twitter: {
    card: "summary_large_image",
    title: "PRAXIS - AI Prompt Engineering Platform",
    description: "Transform any rough idea into a perfectly crafted prompt.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="font-sans antialiased bg-[#0a0a0f] text-white min-h-screen">
        <SecurityShield
          enableDevToolsDetection={true}
          enableContextMenuProtection={true}
          enableConsoleProtection={true}
        />
        <Providers>
          {children}
        </Providers>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(20, 20, 28, 0.95)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              borderRadius: '12px',
              padding: '14px 18px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
