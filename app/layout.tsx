import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import CookieBanner from "./components/CookieBanner";
import { ToastProvider } from "./components/Toast";
import PWASetup from "./components/PWASetup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PanhelQuiz — Quiz Battles για Πανελλήνιες",
    template: "%s | PanhelQuiz",
  },
  description: "Διάβασε για τις Πανελλήνιες παίζοντας 1v1 quiz battles με άλλους μαθητές. Μαθηματικά, Φυσική, Χημεία, Ιστορία, Βιολογία, Έκθεση.",
  keywords: ["πανελλήνιες", "quiz", "μαθηματικά λύκειο", "φυσική λύκειο", "προετοιμασία πανελλήνιες", "online quiz", "εξετάσεις λύκειο"],
  authors: [{ name: "PanhelQuiz" }],
  creator: "PanhelQuiz",
  metadataBase: new URL("https://panhelquiz.vercel.app"),
  openGraph: {
    type: "website",
    locale: "el_GR",
    url: "https://panhelquiz.vercel.app",
    siteName: "PanhelQuiz",
    title: "PanhelQuiz — Quiz Battles για Πανελλήνιες",
    description: "Διάβασε για τις Πανελλήνιες παίζοντας 1v1 quiz battles με άλλους μαθητές.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PanhelQuiz — Quiz Battles για Πανελλήνιες",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PanhelQuiz — Quiz Battles για Πανελλήνιες",
    description: "Διάβασε για τις Πανελλήνιες παίζοντας 1v1 quiz battles με άλλους μαθητές.",
    images: ["/og-image.png"],
  },
  verification: {
    google: 'q9ElaB6qtL8MUliH9dnlBISBLaYqgdjWlhHiWtOk6g8',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `html { visibility: hidden }` }} />
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (localStorage.getItem('panhelquiz-theme') === 'dark') {
              document.documentElement.style.background = '#0A0E14';
            }
          } catch(e) {}
        `}} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <ToastProvider>
            {children}
            <CookieBanner />
            <PWASetup />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}