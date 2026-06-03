import Link from "next/link";
import {
  CalendarDays,
  Radio,
  ExternalLink,
  ArrowRight,
  Users,
  Wallet,
  Newspaper,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  assemblyStatus,
  schedule,
  sessionWindows,
  juneSupplement,
  recentMovements,
} from "@/data/mock";

export const dynamic = "force-dynamic";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function diffDays(from: Date, to: Date) {
  return Math.round(
    (startOfDay(to).getTime() - startOfDay(from).getTime()) /
      (1000 * 60 * 60 * 24),
  );
}
function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

const categoryColor: Record<string, string> = {
  本会議: "bg-wakayama-orange",
  常任委員会: "bg-wakayama-blue",
  特別委員会: "bg-wakayama-green",
  議会運営委員会: "bg-slate-500",
  その他: "bg-slate-400",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const weekday = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return {
    month: d.getMonth() + 1,
    day: d.getDate(),
    weekday,
  };
}

export default function HomePage() {
  // 今日（サーバー時刻）を基準に会期状態とカウントダウンを動的算出
  const today = new Date();
  const currentSession = sessionWindows.find((w) => {
    const o = new Date(w.open);
    const c = new Date(w.close);
    return startOfDay(today) >= startOfDay(o) && startOfDay(today) <= startOfDay(c);
  });
  const nextSession = sessionWindows.find(
    (w) => startOfDay(new Date(w.open)) > startOfDay(today),
  );

  const isInSession = !!currentSession;
  const statusLabel = isInSession ? "ただいま 開会中" : "閉会中";

  // カウントダウン表示用ラベル
  let countdownTitle = "次回";
  let countdownText = assemblyStatus.todayAgenda;
  if (currentSession) {
    const closeDate = new Date(currentSession.close);
    if (isSameDay(today, new Date(currentSession.open))) {
      countdownTitle = `${currentSession.name}`;
      countdownText = "本日 開会";
    } else if (isSameDay(today, closeDate)) {
      countdownTitle = `${currentSession.name}`;
      countdownText = "本日 閉会";
    } else {
      const days = diffDays(today, closeDate);
      countdownTitle = `${currentSession.name} 開会中`;
      countdownText = `閉会まで あと ${days} 日`;
    }
  } else if (nextSession) {
    const openDate = new Date(nextSession.open);
    const days = diffDays(today, openDate);
    countdownTitle = `次の本会議（${nextSession.name} 初日）まで`;
    countdownText = days === 0 ? "本日 開会" : `あと ${days} 日`;
  }

  // Schedule: 過去の項目は非表示、今日以降のみ
  const todayStart = startOfDay(today);
  const upcomingSchedule = schedule.filter(
    (s) => startOfDay(new Date(s.date)).getTime() >= todayStart.getTime(),
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-grid-faint opacity-60" aria-hidden />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-wakayama-orange/10 blur-3xl" aria-hidden />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-wakayama-blue/10 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {isInSession ? (
              <Badge variant="live" className="gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                </span>
                {statusLabel}
              </Badge>
            ) : (
              <Badge variant="muted">{statusLabel}</Badge>
            )}
            <Badge variant="outline">直近：{assemblyStatus.sessionName}</Badge>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
            和歌山県議会を、<br className="sm:hidden" />
            <span className="text-wakayama-orange">みんなのもの</span>に。
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
            議会の日程、予算の使い道、議員一人ひとりの活動を
            やさしく可視化するシビックテック・ポータル。
            県民の暮らしに直結する議論を、スマホからでも追いかけられます。
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/members"
              className="inline-flex items-center gap-2 rounded-md bg-wakayama-orange px-6 h-11 text-sm font-semibold text-white hover:bg-wakayama-orange/90 shadow-sm transition-colors"
            >
              <Users size={16} />
              議員を探す（41名）
              <ArrowRight size={16} />
            </Link>
            <a
              href={assemblyStatus.liveStreamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-6 h-11 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <Radio size={16} />
              議会中継・会議録
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Status cards */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold text-slate-500">会期ステータス</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {assemblyStatus.term}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold text-slate-500">
                {countdownTitle}
              </p>
              <p className="mt-1 text-lg font-bold text-wakayama-orange leading-snug">
                {countdownText}
              </p>
            </div>
            <div className="rounded-xl border border-wakayama-blue/30 bg-wakayama-blue-soft p-5">
              <p className="text-xs font-semibold text-wakayama-blue-dark">
                直近の審議概要
              </p>
              <p className="mt-1 text-sm text-slate-800 leading-relaxed">
                {assemblyStatus.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent movements */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-wakayama-blue-dark">
            <Newspaper size={18} />
            <p className="text-sm font-semibold tracking-wider uppercase">
              Recent Movements
            </p>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            県政の最近の動き
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            令和8年2月定例会 知事説明要旨より、県政トピックスをピックアップ。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentMovements.map((n) => (
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
      </section>

      {/* Schedule timeline */}
      <section
        id="schedule"
        className="bg-white border-y border-slate-200"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-wakayama-blue-dark">
                <CalendarDays size={18} />
                <p className="text-sm font-semibold tracking-wider uppercase">
                  Schedule
                </p>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                議会日程
              </h2>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              令和8年2月定例会の振り返り＋次回予定
            </p>
          </div>

          {(() => {
            const PREVIEW_COUNT = 3;
            const previewItems = upcomingSchedule.slice(0, PREVIEW_COUNT);
            const restItems = upcomingSchedule.slice(PREVIEW_COUNT);
            const renderItem = (item: (typeof upcomingSchedule)[number]) => {
              const d = formatDate(item.date);
              const itemDate = new Date(item.date);
              const isToday = isSameDay(today, itemDate);
              const color = categoryColor[item.category] ?? "bg-slate-400";
              return (
                <li key={item.date + item.title} className="pl-6 relative">
                  <span
                    className={`absolute -left-[9px] top-2 h-4 w-4 rounded-full border-2 border-white ring-2 ${
                      isToday ? "ring-wakayama-orange" : "ring-slate-300"
                    } ${color}`}
                  />
                  <div
                    className={`rounded-xl border p-4 sm:p-5 transition-colors ${
                      isToday
                        ? "border-wakayama-orange/40 bg-wakayama-orange-soft"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900">
                            {d.month}月{d.day}日
                            <span className="text-xs font-medium text-slate-500 ml-1">
                              ({d.weekday})
                            </span>
                          </span>
                          <Badge
                            variant={
                              item.category === "本会議"
                                ? "default"
                                : item.category === "常任委員会"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {item.category}
                          </Badge>
                          {isToday && <Badge variant="live">本日</Badge>}
                        </div>
                        <p className="mt-2 text-base font-semibold text-slate-900">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            };

            if (upcomingSchedule.length === 0) {
              return (
                <p className="text-sm text-slate-500">
                  今後の日程は現時点で公開されていません。
                </p>
              );
            }

            return (
              <>
                <ol className="relative border-l-2 border-slate-200 ml-2 space-y-5">
                  {previewItems.map(renderItem)}
                </ol>

                {restItems.length > 0 && (
                  <details className="group mt-5">
                    <summary className="list-none cursor-pointer inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 h-10 text-sm font-semibold text-slate-700 hover:border-wakayama-orange hover:text-wakayama-orange-dark transition-colors select-none">
                      <ChevronDown
                        size={16}
                        className="transition-transform group-open:rotate-180"
                      />
                      <span className="group-open:hidden">
                        残り{restItems.length}件の日程を表示
                      </span>
                      <span className="hidden group-open:inline">
                        折りたたむ
                      </span>
                    </summary>
                    <ol className="relative border-l-2 border-slate-200 ml-2 mt-5 space-y-5">
                      {restItems.map(renderItem)}
                    </ol>
                  </details>
                )}
              </>
            );
          })()}
        </div>
      </section>

      {/* 6月補正予算（案） */}
      <section id="budget" className="bg-white border-y border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-wakayama-orange-dark">
              <Wallet size={18} />
              <p className="text-sm font-semibold tracking-wider uppercase">
                Supplementary Budget
              </p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {juneSupplement.fiscalYear}
              {juneSupplement.name}
            </h2>
            <p className="text-sm text-slate-700 mt-2 leading-relaxed max-w-3xl">
              {juneSupplement.headline}
            </p>
          </div>

          {/* 補正額サマリー */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold text-slate-500">
                補正前 現計予算
              </p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {juneSupplement.generalAccount.before.toLocaleString()}
                <span className="text-sm font-medium text-slate-500 ml-1">
                  百万円
                </span>
              </p>
            </div>
            <div className="rounded-xl border border-wakayama-orange/30 bg-wakayama-orange-soft p-5">
              <p className="text-xs font-semibold text-wakayama-orange-dark">
                6月補正額
              </p>
              <p className="mt-1 text-xl font-bold text-wakayama-orange-dark">
                +{juneSupplement.generalAccount.supplement.toLocaleString()}
                <span className="text-sm font-medium ml-1">百万円</span>
              </p>
              <p className="text-[11px] text-wakayama-orange-dark/80 mt-0.5">
                （{juneSupplement.amountText}）
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold text-slate-500">
                6月補正後 現計
              </p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {juneSupplement.generalAccount.after.toLocaleString()}
                <span className="text-sm font-medium text-slate-500 ml-1">
                  百万円
                </span>
              </p>
            </div>
          </div>

          {/* 主要事業（カテゴリ） */}
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {juneSupplement.expenditure.map((e) => (
              <Card key={e.label}>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">歳出</CardDescription>
                  <CardTitle className="text-base leading-snug">
                    {e.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold text-wakayama-orange-dark tabular-nums">
                    {e.value.toLocaleString()}
                    <span className="text-xs font-medium text-slate-500 ml-1">
                      百万円
                    </span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/about#june-supplement"
              className="inline-flex items-center gap-2 rounded-md bg-wakayama-orange px-6 h-11 text-sm font-semibold text-white hover:bg-wakayama-orange/90 shadow-sm transition-colors"
            >
              6月補正の主要事業を見る
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-6 h-11 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
            >
              県政について（当初予算の概要）
              <ArrowRight size={16} />
            </Link>
          </div>
          <p className="mt-4 text-[11px] text-slate-400">
            {juneSupplement.sourceNote}
          </p>
        </div>
      </section>
    </div>
  );
}
