"use client";
import React, { createContext, useState } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import Sidebar from "../components/Sidebar";

export const SidebarContext = createContext<{collapsed: boolean, setCollapsed: (v: boolean) => void}>({collapsed: false, setCollapsed: () => {}});

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <ThemeProvider>
      <AuthProvider>
        <SidebarContext.Provider value={{collapsed, setCollapsed}}>
          <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Sidebar />
            <main
              id="main-content"
              className={`flex-1 p-8 min-h-screen transition-all duration-300 ml-0 ${collapsed ? 'lg:ml-[80px]' : 'lg:ml-[256px]'}`}
            >
              {children}
            </main>
          </div>
        </SidebarContext.Provider>
      </AuthProvider>
    </ThemeProvider>
  );
} 