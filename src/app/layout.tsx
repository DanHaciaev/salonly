import type { Metadata } from "next";
import { Fraunces, Inter, Caveat } from "next/font/google";
import "./globals.css";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

const fontHeading = Fraunces({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz", "SOFT", "WONK"],
});

const fontScript = Caveat({
  variable: "--font-script",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Salonly — платформа онлайн-записи для салонов красоты",
  description:
    "Сайт бронирования, CRM и уведомления для салонов красоты — своя страница, своя команда, свои клиенты.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${fontSans.variable} ${fontHeading.variable} ${fontScript.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
