import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://forgecareer.io"),
  title: "Forge - Automated Job Search",
  description: "Stop wasting hours searching and applying. Let our intelligent system find your perfect matches.",
  icons: {
    icon: "/icon.png?v=1",
    apple: "/icon.png?v=1",
  },
  openGraph: {
    title: "Forge - Automated Job Search",
    description: "The intelligent system that finds your perfect job matches.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Forge",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextAuthProvider>
          {/* Mobile Blocker */}
          <div className="flex flex-col items-center justify-center fixed inset-0 z-[9999] bg-slate-900 md:hidden p-8 text-center">
            <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-8 border border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.15)]">
              <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-4">Desktop Required</h1>
            <p className="text-slate-400 font-medium text-[15px] leading-relaxed max-w-[280px] mx-auto">
              Forge is currently optimized exclusively for desktop. Please open this platform on your computer to continue your automated job search.
            </p>
          </div>
          
          {/* Desktop App Content */}
          <div className="hidden md:flex md:flex-col md:min-h-full md:w-full relative overflow-hidden">
            {/* Background Aura */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
              <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-400/5 blur-[120px] animate-mesh" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/5 blur-[120px] animate-mesh" style={{ animationDelay: '-5s' }} />
              <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-cyan-400/5 blur-[100px] animate-mesh" style={{ animationDelay: '-10s' }} />
            </div>
            {children}
          </div>
        </NextAuthProvider>
      </body>
    </html>
  );
}
