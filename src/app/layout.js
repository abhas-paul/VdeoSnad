import { Poppins } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/Provider/SessionProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "VdeoSnad - Video Conferencing",
  description: "A modern video conferencing platform built with Next.js",
  keywords: ["video conferencing", "meeting", "next.js"],
  authors: [{ name: "VdeoSnad Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} antialiased min-h-screen bg-white dark:bg-gray-900`}>
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
