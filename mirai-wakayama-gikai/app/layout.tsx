import type { Metadata } from "next";
import { Noto_Sans_JP, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AlertTriangle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://mirai-wakayama-ken-gikai.vercel.app";
const SITE_NAME = "みらいのわかやま県議会";
const SITE_DESCRIPTION =
  "和歌山県議会の日程・予算審議・議員一人ひとりの活動を、誰もが分かりやすく追える可視化ポータル（シビックテックのプロトタイプ）。本会議までのカウントダウン、当初予算6,499億円の使い道、議員41名のプロフィールを公開しています。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | 和歌山県議会を可視化するポータル`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "和歌山県議会",
    "和歌山県",
    "県議会",
    "議会",
    "県議会議員",
    "議員",
    "議会日程",
    "定例会",
    "予算",
    "当初予算",
    "シビックテック",
    "オープンガバメント",
    "可視化",
    "議会ウォッチ",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "government",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | 和歌山県議会を可視化するポータル`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | 和歌山県議会を可視化するポータル`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-wakayama-ivory">
        <SiteHeader />
        <div
          role="alert"
          className="bg-amber-100 border-y-2 border-amber-400 text-amber-900"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2.5 flex items-start sm:items-center gap-2 text-xs sm:text-sm">
            <AlertTriangle
              size={18}
              className="shrink-0 mt-0.5 sm:mt-0 text-amber-700"
            />
            <p className="leading-relaxed">
              <span className="font-bold">⚠️ ダミーデータ注意：</span>
              本サイトは<strong>シビックテックのプロトタイプ</strong>です。掲載情報は<strong>すべてダミーデータ</strong>であり、
              <strong>和歌山県・県議会・議員個人とは一切関係ありません。</strong>
            </p>
          </div>
        </div>
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
