import type { Metadata } from "next";
import "./globals.css";
import ClientRoot from "./ClientRoot";
import { ThemeProvider } from "@/hooks/useTheme.tsx";

export const metadata: Metadata = {
  title: "Campus Hub - Образовательная платформа",
  description: "Современная образовательная платформа для студентов, преподавателей и администраторов",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <ClientRoot>{children}</ClientRoot>
        </ThemeProvider>
      </body>
    </html>
  );
}
