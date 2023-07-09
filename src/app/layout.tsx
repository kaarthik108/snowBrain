import { Toaster } from "@/components/Toaster";
import { TokenCountProvider } from "@/components/token";
import { ClerkProvider } from "@clerk/nextjs";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const title = "snowBrain";
const description = `snowBrain - AI Driven snowflake data insights`;

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
      <Script async src="https://umami-livid-seven.vercel.app/script.js" data-website-id="b0156ebc-cb72-4891-9ce8-4b7a71c5ca0e"></Script>
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
