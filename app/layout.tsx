import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

import { api } from "@/lib/api";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Fonix Edu — Sri Lanka Exam Papers & School Resources",
    template: "%s | Fonix Edu",
  },
  description:
    "Past papers, model papers, term test papers, syllabus, teacher guides, text books and government gazette for Sri Lankan students.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let roots: any[] = [];
  try {
    roots = await api.getRoots();
  } catch (err) {
    console.error("Failed to fetch root categories in layout:", err);
  }

  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header initialRoots={roots} />
          <main className="flex-1">{children}</main>
          <Footer initialRoots={roots} />
        </ThemeProvider>
      </body>
    </html>
  );
}
