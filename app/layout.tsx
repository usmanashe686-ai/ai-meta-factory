import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider"; // Your custom toast provider

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Meta Factory",
  description: "Generate full-stack applications with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <ToastProvider /> {/* Allows react-hot-toast or custom toast notifications to work globally */}
      </body>
    </html>
  );
}
