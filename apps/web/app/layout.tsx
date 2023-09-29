import { Route } from "next";
import NextLink from "next/link";

import { ThemeProvider } from "@/components/theme-provider";

import "@ui/styles/globals.css";
import { Button } from "@ui/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Analytics } from "@vercel/analytics/react";
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="flex justify-between h-12 max-h-12 items-center py-2 px-5 border-b">
              <h4 className="mb-0 text-lg truncate font-medium">
                <NextLink href="/">Dependafeed</NextLink>
              </h4>
              <div className="flex gap-2">
                <NextLink href={"/sign-in" as Route}>
                  <Button variant="outline" size="sm">
                    Sign in
                  </Button>
                </NextLink>
                <ModeToggle />
              </div>
            </div>
            {children}
            <Analytics />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
