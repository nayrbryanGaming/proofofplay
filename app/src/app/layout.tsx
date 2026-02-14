import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AppWalletProvider from "../components/AppWalletProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Proof of Play Dungeon",
  description: "Infinite On-Chain Dungeon Crawler on Solana",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00ff41" />
      </head>
      <body className={inter.className}>
        <AppWalletProvider>
          {children}
        </AppWalletProvider>
      </body>
    </html>
  );
}
