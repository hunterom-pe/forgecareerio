"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./ThemeProvider";
import { SWRConfig } from "swr";

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SWRConfig 
        value={{
          fetcher: (url: string) => fetch(url).then(res => res.json()),
          revalidateOnFocus: false,
          shouldRetryOnError: false
        }}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </SWRConfig>
    </SessionProvider>
  );
}
