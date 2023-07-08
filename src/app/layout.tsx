import { Toaster } from "@/components/Toaster";
import { TokenCountProvider } from "@/components/token";
import { ClerkProvider } from "@clerk/nextjs";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const title = "snowbrain";
const description = `snowbrain - AI Driven snowflake data insights`;

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
  },
  twitter: {
    title,
    description,
    card: "summary_large_image",
    creator: "@kaarthikcodes",
  },
  metadataBase: new URL("https://snowbrain.dev/"),
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Script
        async
        id="umami"
        src="https://umami-livid-seven.vercel.app/script.js"
        data-website-id="a626f755-5202-4315-8841-43dfa42676df"
      ></Script>
      <ClerkProvider>
        <body className={inter.className}>
          <TokenCountProvider>
            <Toaster />
            {children}
          </TokenCountProvider>
        </body>
      </ClerkProvider>
    </html>
  );
}
