import type { Metadata } from "next";
import { Philosopher, Mulish } from "next/font/google";
import { Toaster } from "sonner";
import CommandPalette from "@/components/search/command-palette";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const philosopher = Philosopher({
  variable: "--font-philosopher",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Study Buddy",
  description: "Empower your studying habits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${philosopher.variable} ${mulish.variable} antialiased`}>
        <ThemeProvider>
          {children}
          <CommandPalette />
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

