import type { Metadata } from "next";
import { Users } from "lucide-react";
import { MembersExplorer } from "@/components/members-explorer";
import { members, parties, districts } from "@/data/mock";

export const metadata: Metadata = {
  title: "議員一覧",
  description:
    "和歌山県議会議員（令和8年4月1日現在・現員41名）の一覧。会派・選挙区・年代で絞り込み、一人ひとりの活動やプロフィールを確認できます。",
  alternates: { canonical: "/members" },
  openGraph: {
    title: "議員一覧 | みらいのわかやま県議会",
    description:
      "和歌山県議会議員（現員41名）の一覧。会派・選挙区・年代で絞り込み、一人ひとりの活動を確認できます。",
    url: "/members",
    type: "website",
  },
};

export default function MembersPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex items-center gap-2 text-wakayama-orange-dark">
        <Users size={18} />
        <p className="text-sm font-semibold tracking-wider uppercase">
          Members
        </p>
      </div>
      <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">
        議員を探す
      </h1>
      <p className="mt-2 text-sm text-slate-600 max-w-2xl">
        和歌山県議会議員名簿（令和8年6月10日現在・定数42人／欠員1＝現員{" "}
        {members.length} 名）。会派・選挙区・年代で絞り込んで、一人ひとりの活動をチェックできます。
      </p>
      <p className="mt-2 text-xs text-slate-500">
        ※第96代議長：堀 龍雄／第102代副議長：佐藤 武治（令和8年6月10日現在）
      </p>

      <div className="mt-8">
        <MembersExplorer
          members={members}
          parties={parties}
          districts={districts}
        />
      </div>
    </div>
  );
}
