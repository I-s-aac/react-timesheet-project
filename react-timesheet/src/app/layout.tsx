import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navigation from "../components/Navigation";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { TimesheetProvider } from "@/contexts/TimesheetContext";
import { UserProvider } from "@/contexts/UserContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Timesheet App",
  description: "Create and store timesheets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased p-0 m-0 h-[100vh]`}
      >
        <AppRouterCacheProvider>
          <UserProvider>
            <TimesheetProvider>
              <div className="flex">
                <Navigation />

                <main>
                  {children} {/* Renders the page content */}
                </main>
              </div>
            </TimesheetProvider>
          </UserProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
