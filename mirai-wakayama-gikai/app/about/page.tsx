import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  ExternalLink,
  PieChart as PieChartIcon,
  BarChart3,
  Sparkles,
  Landmark,
  Wallet,
  ArrowRight,
  Megaphone,
  CalendarClock,
  Newspaper,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BudgetPieChart } from "@/components/charts/budget-pie-chart";
import { PriorityBarChart } from "@/components/charts/priority-bar-chart";
import {
  budgetPicks,
  budgetBreakdown,
  priorityPolicies,
  juneSupplement,
  septemberSupplement,
  septemberDebtObligations,
  septemberGovernorStatement,
  pastMovements,
  pastMovementsSource,
} from "@/data/mock";

export const metadata: Metadata = {
  title: "県政について",
  description:
    "和歌山県の令和8年度当初予算（一般会計6,499億円・過去最大規模）の概要、新総合計画「6本の政策の柱」、予算の使い道、9月補正予算（案）・知事説明要旨、6月補正予算（案）をまとめた県政の解説ページです。",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "県政について | みらいのわかやま県議会",
    description:
      "和歌山県の令和8年度当初予算の概要・6本の政策の柱・予算の使い道・9月補正予算・6月補正予算をまとめた県政解説ページ。",
    url: "/about",
    type: "website",
  },
};

function fmtOku(thousandYen: number) {
  // 千円 → 表示用（億円 or 百万円）
  const oku = thousandYen / 100000; // 千円→億円
  if (oku >= 1) return `${oku.toLocaleString(undefined, { maximumFractionDigits: 1 })} 億円`;
  return `${(thousandYen / 1000).toLocaleString()} 百万円`;
}

export default function AboutPage() {
  const totalBudget = budgetBreakdown.reduce((s, b) => s + b.value, 0);
  const ga = juneSupplement.generalAccount;
  const sga = septemberSupplement.generalAccount;

  return (
    <div>
      {/* Page header */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-grid-faint opacity-60" aria-hidden />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-wakayama-blue/10 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-center gap-2 text-wakayama-blue-dark">
            <Landmark size={18} />
            <p className="text-sm font-semibold tracking-wider uppercase">
              About Prefectural Government
            </p>
          </div>
          <h1 className="mt-1 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            県政について
          </h1>
          <p className="mt-3 text-base text-slate-600 max-w-3xl leading-relaxed">
            和歌山県の令和8年度当初予算の概要、新総合計画で掲げる「6本の政策の柱」、
            予算の使い道、そして各定例会の補正予算（9月・6月）を分かりやすくまとめました。
          </p>

          {/* quick nav */}
          <div className="mt-6 flex flex-wrap gap-2">
            <a href="#governor-statement" className="inline-flex items-center gap-1.5 rounded-full border border-wakayama-orange/40 bg-wakayama-orange-soft px-4 h-9 text-sm font-semibold text-wakayama-orange-dark hover:border-wakayama-orange transition-colors">
              知事説明要旨（9月）
            </a>
            <a href="#september-supplement" className="inline-flex items-center gap-1.5 rounded-full border border-wakayama-orange/40 bg-wakayama-orange-soft px-4 h-9 text-sm font-semibold text-wakayama-orange-dark hover:border-wakayama-orange transition-colors">
              9月補正予算（案）
            </a>
            <a href="#initial-budget" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 h-9 text-sm font-semibold text-slate-700 hover:border-wakayama-orange hover:text-wakayama-orange-dark transition-colors">
              令和8年度 当初予算
            </a>
            <a href="#infographic" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 h-9 text-sm font-semibold text-slate-700 hover:border-wakayama-orange hover:text-wakayama-orange-dark transition-colors">
              予算のゆくえ
            </a>
            <a href="#june-supplement" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 h-9 text-sm font-semibold text-slate-700 hover:border-wakayama-orange hover:text-wakayama-orange-dark transition-colors">
              6月補正予算（案）
            </a>
            <a href="#past-movements" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 h-9 text-sm font-semibold text-slate-700 hover:border-wakayama-orange hover:text-wakayama-orange-dark transition-colors">
              過去の県政の動き
            </a>
          </div>
        </div>
      </section>

      {/* 知事説明要旨（9月定例会） */}
      <section id="governor-statement" className="mx-auto max-w-6xl px-4 sm:px-6 py-14 scroll-mt-20">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-wakayama-orange-dark">
            <Megaphone size={18} />
            <p className="text-sm font-semibold tracking-wider uppercase">
              Governor&apos;s Statement
            </p>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            {septemberGovernorStatement.sessionName} 知事説明要旨
          </h2>
          <p className="text-sm text-slate-700 mt-2 leading-relaxed max-w-3xl">
            {septemberGovernorStatement.lead}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {septemberGovernorStatement.topics.map((t) => (
            <Card key={t.heading} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base leading-snug">
                  {t.heading}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-slate-600 leading-relaxed">{t.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-2">
            提出された議案等
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {septemberGovernorStatement.bills}
          </p>
        </div>

        <p className="mt-4 text-[11px] text-slate-400">
          {septemberGovernorStatement.sourceNote}
        </p>
      </section>

      {/* 9月補正予算 */}
      <section
        id="september-supplement"
        className="bg-white border-y border-slate-200 scroll-mt-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-wakayama-orange-dark">
              <Wallet size={18} />
              <p className="text-sm font-semibold tracking-wider uppercase">
                Supplementary Budget (Sep)
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {septemberSupplement.fiscalYear}
                {septemberSupplement.name}
              </h2>
              <Badge variant="default">最新</Badge>
            </div>
            <p className="text-sm text-slate-700 mt-2 leading-relaxed max-w-3xl">
              {septemberSupplement.headline}
            </p>
          </div>

          {/* 補正額サマリー */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold text-slate-500">補正前 現計予算</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {sga.before.toLocaleString()}
                <span className="text-sm font-medium text-slate-500 ml-1">百万円</span>
              </p>
            </div>
            <div className="rounded-xl border border-wakayama-orange/30 bg-wakayama-orange-soft p-5">
              <p className="text-xs font-semibold text-wakayama-orange-dark">9月補正額</p>
              <p className="mt-1 text-xl font-bold text-wakayama-orange-dark">
                +{sga.supplement.toLocaleString()}
                <span className="text-sm font-medium ml-1">百万円</span>
              </p>
              <p className="text-[11px] text-wakayama-orange-dark/80 mt-0.5">
                （{septemberSupplement.amountText}）
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold text-slate-500">9月補正後 現計</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {sga.after.toLocaleString()}
                <span className="text-sm font-medium text-slate-500 ml-1">百万円</span>
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            【参考】{septemberSupplement.previousYearRef.label}の9月補正額は{" "}
            {septemberSupplement.previousYearRef.supplement.toLocaleString()} 百万円（9月補正後現計{" "}
            {septemberSupplement.previousYearRef.after.toLocaleString()} 百万円）。
          </p>

          {/* 歳入・歳出フレーム */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">歳入の補正</CardTitle>
                <CardDescription>主な財源の内訳（百万円）</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-slate-100">
                  {septemberSupplement.revenue.map((r) => (
                    <li key={r.label} className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-slate-700">{r.label}</span>
                      <span className={`text-sm font-semibold tabular-nums ${r.value < 0 ? "text-rose-600" : "text-slate-900"}`}>
                        {r.value < 0 ? "▲" : ""}
                        {Math.abs(r.value).toLocaleString()}
                      </span>
                    </li>
                  ))}
                  <li className="flex items-center justify-between py-2.5 border-t-2 border-slate-200">
                    <span className="text-sm font-bold text-slate-900">計</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      {sga.supplement.toLocaleString()}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">歳出の補正</CardTitle>
                <CardDescription>主な使い道の内訳（百万円）</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-slate-100">
                  {septemberSupplement.expenditure.map((e) => (
                    <li key={e.label} className="flex items-start justify-between gap-3 py-2.5">
                      <span className="text-sm text-slate-700">{e.label}</span>
                      <span className="text-sm font-semibold text-slate-900 tabular-nums shrink-0">
                        {e.value.toLocaleString()}
                      </span>
                    </li>
                  ))}
                  <li className="flex items-center justify-between py-2.5 border-t-2 border-slate-200">
                    <span className="text-sm font-bold text-slate-900">計</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      {sga.supplement.toLocaleString()}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* 主要事業 */}
          <h3 className="mt-10 mb-4 text-xl font-bold text-slate-900">主要事業</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {septemberSupplement.projects.map((p) => (
              <Card key={p.title} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Badge variant="secondary" className="w-fit">
                      {p.category}
                    </Badge>
                    <span className="text-sm font-bold text-wakayama-orange-dark tabular-nums">
                      {fmtOku(p.amountThousand)}
                    </span>
                  </div>
                  <CardTitle className="text-base leading-snug mt-2">
                    {p.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    担当：{p.dept}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {p.summary}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 債務負担行為 */}
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock size={18} className="text-wakayama-blue" />
              <h3 className="text-xl font-bold text-slate-900">
                債務負担行為の設定
              </h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              翌年度以降の支出を約束する「債務負担行為」を14件設定（追加・変更）します。概要に記載された主なものは次のとおりです。
            </p>
            <ul className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
              {septemberDebtObligations.map((d) => (
                <li key={d.title} className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900">{d.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">担当：{d.dept}</p>
                    </div>
                    <span className="text-sm font-bold text-wakayama-blue-dark tabular-nums shrink-0">
                      {fmtOku(d.amountThousand)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {d.summary}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-6 text-[11px] text-slate-400">
            {septemberSupplement.sourceNote}
          </p>
        </div>
      </section>

      {/* アーカイブ見出し */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-14">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-200" aria-hidden />
          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Archive ／ これまでの予算・県政の動き
          </p>
          <span className="h-px flex-1 bg-slate-200" aria-hidden />
        </div>
      </div>

      {/* 当初予算 6本の柱 */}
      <section id="initial-budget" className="mx-auto max-w-6xl px-4 sm:px-6 py-14 scroll-mt-20">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-wakayama-orange-dark">
            <Sparkles size={18} />
            <p className="text-sm font-semibold tracking-wider uppercase">
              Initial Budget
            </p>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            令和8年度当初予算 6本の政策の柱
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            新総合計画の初年度予算。一般会計 6,499億円（対前年度+360億円、当初予算として過去最大規模）のうち、新総合計画で掲げる6本の政策の柱を紹介します。
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {budgetPicks.map((pick) => (
            <Card
              key={pick.id}
              className="flex flex-col hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <Badge variant="default" className="w-fit mb-2">
                  {pick.category}
                </Badge>
                <CardTitle className="text-lg leading-snug">
                  {pick.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pb-3">
                <CardDescription className="text-slate-700 leading-relaxed">
                  {pick.summary}
                </CardDescription>
                <ul className="mt-4 space-y-1.5">
                  {pick.highlights.map((h) => (
                    <li
                      key={h}
                      className="text-xs text-slate-600 flex items-start gap-2"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-wakayama-orange" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <a
                  href={pick.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-wakayama-blue hover:text-wakayama-blue-dark"
                >
                  <FileText size={14} />
                  議案・関連資料を見る
                  <ExternalLink size={12} />
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Infographics */}
      <section id="infographic" className="bg-white border-y border-slate-200 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-wakayama-blue-dark">
              <PieChartIcon size={18} />
              <p className="text-sm font-semibold tracking-wider uppercase">
                Infographic
              </p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              予算のゆくえ / 重点施策
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              知事の提案理由説明から、予算の使い道と重点施策を可視化しました。
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon size={18} className="text-wakayama-orange" />
                  一般会計 歳出の内訳
                </CardTitle>
                <CardDescription>
                  人件費・公債費・投資的経費・社会保障関係経費ほか（億円）
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BudgetPieChart data={budgetBreakdown} />
                <p className="text-center text-sm text-slate-600 mt-2">
                  令和8年度 一般会計{" "}
                  <span className="font-bold text-slate-900">
                    {totalBudget.toLocaleString()}
                  </span>{" "}
                  億円
                  <span className="block text-[11px] text-slate-400 mt-1">
                    ※ 令和8年度当初予算（案）の概要より
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 size={18} className="text-wakayama-orange" />
                  政策の柱別 配分イメージ
                </CardTitle>
                <CardDescription>
                  新総合計画「6本の柱」の配分イメージ（億円・概算）
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PriorityBarChart data={priorityPolicies} />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 6月補正予算 */}
      <section id="june-supplement" className="mx-auto max-w-6xl px-4 sm:px-6 py-14 scroll-mt-20">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-wakayama-orange-dark">
            <Wallet size={18} />
            <p className="text-sm font-semibold tracking-wider uppercase">
              Supplementary Budget
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {juneSupplement.fiscalYear}{juneSupplement.name}
            </h2>
            <Badge variant="outline">令和8年6月定例会</Badge>
          </div>
          <p className="text-sm text-slate-700 mt-2 leading-relaxed max-w-3xl">
            {juneSupplement.headline}
          </p>
        </div>

        {/* 補正額サマリー */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold text-slate-500">補正前 現計予算</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {ga.before.toLocaleString()}
              <span className="text-sm font-medium text-slate-500 ml-1">百万円</span>
            </p>
          </div>
          <div className="rounded-xl border border-wakayama-orange/30 bg-wakayama-orange-soft p-5">
            <p className="text-xs font-semibold text-wakayama-orange-dark">6月補正額</p>
            <p className="mt-1 text-xl font-bold text-wakayama-orange-dark">
              +{ga.supplement.toLocaleString()}
              <span className="text-sm font-medium ml-1">百万円</span>
            </p>
            <p className="text-[11px] text-wakayama-orange-dark/80 mt-0.5">
              （{juneSupplement.amountText}）
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold text-slate-500">6月補正後 現計</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {ga.after.toLocaleString()}
              <span className="text-sm font-medium text-slate-500 ml-1">百万円</span>
            </p>
          </div>
        </div>

        {/* 歳入・歳出フレーム */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">歳入の補正</CardTitle>
              <CardDescription>主な財源の内訳（百万円）</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-slate-100">
                {juneSupplement.revenue.map((r) => (
                  <li key={r.label} className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-slate-700">{r.label}</span>
                    <span className={`text-sm font-semibold tabular-nums ${r.value < 0 ? "text-rose-600" : "text-slate-900"}`}>
                      {r.value < 0 ? "▲" : ""}
                      {Math.abs(r.value).toLocaleString()}
                    </span>
                  </li>
                ))}
                <li className="flex items-center justify-between py-2.5 border-t-2 border-slate-200">
                  <span className="text-sm font-bold text-slate-900">計</span>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">
                    {juneSupplement.generalAccount.supplement.toLocaleString()}
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">歳出の補正</CardTitle>
              <CardDescription>主な使い道の内訳（百万円）</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-slate-100">
                {juneSupplement.expenditure.map((e) => (
                  <li key={e.label} className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-slate-700">{e.label}</span>
                    <span className="text-sm font-semibold text-slate-900 tabular-nums">
                      {e.value.toLocaleString()}
                    </span>
                  </li>
                ))}
                <li className="flex items-center justify-between py-2.5 border-t-2 border-slate-200">
                  <span className="text-sm font-bold text-slate-900">計</span>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">
                    {juneSupplement.generalAccount.supplement.toLocaleString()}
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 主要事業 */}
        <h3 className="mt-10 mb-4 text-xl font-bold text-slate-900">主要事業</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {juneSupplement.projects.map((p) => (
            <Card key={p.title} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Badge variant="secondary" className="w-fit">
                    {p.category}
                  </Badge>
                  <span className="text-sm font-bold text-wakayama-orange-dark tabular-nums">
                    {fmtOku(p.amountThousand)}
                  </span>
                </div>
                <CardTitle className="text-base leading-snug mt-2">
                  {p.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  担当：{p.dept}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-slate-600 leading-relaxed">
                  {p.summary}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-6 text-[11px] text-slate-400">{juneSupplement.sourceNote}</p>
      </section>

      {/* 過去の県政の動き（アーカイブ） */}
      <section
        id="past-movements"
        className="bg-white border-y border-slate-200 scroll-mt-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-wakayama-blue-dark">
              <Newspaper size={18} />
              <p className="text-sm font-semibold tracking-wider uppercase">
                Past Movements
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                過去の県政の動き
              </h2>
              <Badge variant="outline">{pastMovementsSource.sessionName}</Badge>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              {pastMovementsSource.sessionName} 知事説明要旨で報告された県政トピックスのアーカイブです。
              最新の動きはトップページに掲載しています。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastMovements.map((n) => (
              <Card key={n.title} className="flex flex-col">
                <CardHeader className="pb-2">
                  <Badge variant="secondary" className="w-fit">
                    {n.category}
                  </Badge>
                  <CardTitle className="text-base leading-snug mt-2">
                    {n.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {n.summary}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="mt-6 text-[11px] text-slate-400">
            {pastMovementsSource.sourceNote}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/members"
              className="inline-flex items-center gap-2 rounded-md bg-wakayama-orange px-6 h-11 text-sm font-semibold text-white hover:bg-wakayama-orange/90 shadow-sm transition-colors"
            >
              議員の活動を見る
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/#news"
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-6 h-11 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
            >
              最新の県政の動きを見る
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
