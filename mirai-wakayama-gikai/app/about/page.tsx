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
} from "@/data/mock";

export const metadata: Metadata = {
  title: "県政について",
  description:
    "和歌山県の令和8年度当初予算（一般会計6,499億円・過去最大規模）の概要、新総合計画「6本の政策の柱」、予算の使い道、6月補正予算（案）をまとめた県政の解説ページです。",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "県政について | みらいのわかやま県議会",
    description:
      "和歌山県の令和8年度当初予算の概要・6本の政策の柱・予算の使い道・6月補正予算をまとめた県政解説ページ。",
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
            予算の使い道、そして直近の6月補正予算（案）を分かりやすくまとめました。
          </p>

          {/* quick nav */}
          <div className="mt-6 flex flex-wrap gap-2">
            <a href="#initial-budget" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 h-9 text-sm font-semibold text-slate-700 hover:border-wakayama-orange hover:text-wakayama-orange-dark transition-colors">
              令和8年度 当初予算
            </a>
            <a href="#infographic" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 h-9 text-sm font-semibold text-slate-700 hover:border-wakayama-orange hover:text-wakayama-orange-dark transition-colors">
              予算のゆくえ
            </a>
            <a href="#june-supplement" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 h-9 text-sm font-semibold text-slate-700 hover:border-wakayama-orange hover:text-wakayama-orange-dark transition-colors">
              6月補正予算（案）
            </a>
          </div>
        </div>
      </section>

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
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            {juneSupplement.fiscalYear}{juneSupplement.name}
          </h2>
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

        <div className="mt-8">
          <Link
            href="/members"
            className="inline-flex items-center gap-2 rounded-md bg-wakayama-orange px-6 h-11 text-sm font-semibold text-white hover:bg-wakayama-orange/90 shadow-sm transition-colors"
          >
            議員の活動を見る
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
