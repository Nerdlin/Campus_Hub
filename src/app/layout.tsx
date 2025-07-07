import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientRoot from "./ClientRoot";
import { ThemeProvider } from '../hooks/useTheme';

export const metadata: Metadata = {
  title: "Campus Hub - Образовательная платформа",
  description: "Современная образовательная платформа для студентов, преподавателей и администраторов",
};

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <ClientRoot>{children}</ClientRoot>
        </ThemeProvider>
      </body>
    </html>
  );
}
