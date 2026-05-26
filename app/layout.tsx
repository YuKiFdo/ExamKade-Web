import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

import { api } from "@/lib/api";
import { Toaster } from "sonner";
import { ConfirmProvider } from "@/components/providers/ConfirmProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "ExamKade — Sri Lanka's Premium Education Resource Platform",
    template: "%s | ExamKade",
  },
  description:
    "The ultimate destination for Sri Lankan students. Access past papers, model papers, term test papers, syllabuses, teacher guides, text books, and government gazettes.",
  keywords: [
    "ExamKade", "Examකඩේ", "Sri Lanka", "Past Papers", "Model Papers", "Term Test Papers", "Syllabus", "Teacher Guides", "Text Books", "Government Gazette", "GCE O/L", "GCE A/L", "Education"
  ],
  authors: [{ name: "ExamKade" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://examkade.lk",
    title: "ExamKade — Sri Lanka's Premium Education Resource Platform",
    description: "The ultimate destination for Sri Lankan students. Access past papers, model papers, term test papers, syllabuses, teacher guides, text books, and government gazettes.",
    siteName: "ExamKade",
  },
  twitter: {
    card: "summary_large_image",
    title: "ExamKade — Sri Lanka's Premium Education Resource Platform",
    description: "The ultimate destination for Sri Lankan students. Access past papers, model papers, term test papers, syllabuses, teacher guides, text books, and government gazettes.",
  },
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
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ConfirmProvider>
            <Header initialRoots={roots} />
            <main className="flex-1">{children}</main>
            <Footer initialRoots={roots} />
          </ConfirmProvider>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
