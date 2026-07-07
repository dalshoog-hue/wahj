import type { Metadata } from "next";
import { Alexandria, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const display = Alexandria({
  subsets: ["arabic"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-display",
});
const body = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "وَهْج — مولّد صفحات الهبوط",
  description: "أنشئ صفحة هبوط احترافية بالذكاء الاصطناعي خلال دقيقة",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar-u-nu-latn" dir="rtl" className={`${display.variable} ${body.variable}`}>
      <body style={{ fontFamily: "var(--font-body), sans-serif" }}>{children}</body>
    </html>
  );
}
