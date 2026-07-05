import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Personal Library — Digital Management System",
    template: "%s | Personal Library",
  },
  description:
    "A permanent, centralized archive for saving and organizing your digital knowledge from any source. Never lose important information again.",
  keywords: [
    "knowledge management",
    "digital archive",
    "personal library",
    "note taking",
    "OCR",
    "research",
  ],
  authors: [{ name: "Personal Library" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Personal Library",
    title: "Personal Library — Digital Management System",
    description:
      "A permanent, centralized archive for saving and organizing your digital knowledge from any source.",
    images: [
      {
        url: "/images/OG image (social share preview).png",
        width: 1200,
        height: 630,
        alt: "Personal Library",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Personal Library",
    description:
      "A permanent, centralized archive for saving and organizing your digital knowledge from any source.",
    images: ["/images/OG image (social share preview).png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF9" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
  width: "device-width",
  initialScale: 1,
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
      className={`${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <QueryProvider>
            <TooltipProvider>
              {children}
              <Toaster richColors position="bottom-right" />
            </TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
