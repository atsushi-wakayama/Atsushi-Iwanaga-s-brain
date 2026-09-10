import type { Metadata } from "next";
import { Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const shippori = Shippori_Mincho({
  variable: "--font-shippori",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const zenKaku = Zen_Kaku_Gothic_New({
  variable: "--font-zen",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "被害箇所マッピング",
  description:
    "現場で撮った写真をGPS情報から自動で地図に配置し、写真の上に手書きで注記を入れられる被害状況記録ツール",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${shippori.variable} ${zenKaku.variable}`}>
      <body>{children}</body>
    </html>
  );
}
