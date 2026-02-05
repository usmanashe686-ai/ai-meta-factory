"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            border: '1px solid #374151',
          },
        }}
      />
    </NextAuthSessionProvider>
  );
}
