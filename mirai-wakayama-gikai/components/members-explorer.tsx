"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Users2,
  Search,
  X,
  ArrowRight,
  Crown,
  Map as MapIcon,
  LayoutGrid,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Member } from "@/data/mock";

type AgeBand = "all" | "20-30s" | "40s" | "50s" | "60s" | "70s+";

const ageBands: { value: AgeBand; label: string }[] = [
  { value: "all", label: "すべての年代" },
  { value: "20-30s", label: "20〜30代" },
  { value: "40s", label: "40代" },
  { value: "50s", label: "50代" },
  { value: "60s", label: "60代" },
  { value: "70s+", label: "70代以上" },
];

function inAgeBand(age: number, band: AgeBand) {
  if (band === "all") return true;
  if (band === "20-30s") return age >= 20 && age < 40;
  if (band === "40s") return age >= 40 && age < 50;
  if (band === "50s") return age >= 50 && age < 60;
  if (band === "60s") return age >= 60 && age < 70;
  return age >= 70;
}

// 選挙区メタ情報（定数は和歌山県議会「委員会等名簿・議員名簿」より）。
// grid は県の地理的な位置関係を模したタイル配置（模式図）。
type DistrictMeta = {
  name: string;
  seats: number;
  vacancy?: number;
  color: string; // タイルの背景色
  col: string; // gridColumn
  row: string; // gridRow
};

const districtMeta: DistrictMeta[] = [
  { name: "和歌山市", seats: 15, vacancy: 1, color: "#bfdbfe", col: "1 / 3", row: "2 / 3" },
  { name: "岩出市", seats: 2, color: "#fdba74", col: "2 / 3", row: "1 / 2" },
  { name: "紀の川市", seats: 3, color: "#fef3c7", col: "3 / 4", row: "1 / 3" },
  { name: "橋本市", seats: 3, color: "#fbcfe8", col: "4 / 6", row: "1 / 2" },
  { name: "伊都郡", seats: 1, color: "#ddd6fe", col: "4 / 6", row: "2 / 3" },
  { name: "海南市・海草郡", seats: 3, color: "#99f6e4", col: "1 / 3", row: "3 / 4" },
  { name: "有田市", seats: 1, color: "#fed7aa", col: "1 / 2", row: "4 / 5" },
  { name: "有田郡", seats: 2, color: "#bbf7d0", col: "2 / 4", row: "4 / 5" },
  { name: "御坊市", seats: 1, color: "#fdba74", col: "1 / 2", row: "5 / 6" },
  { name: "日高郡", seats: 3, color: "#fcd34d", col: "2 / 4", row: "5 / 6" },
  { name: "田辺市", seats: 3, color: "#fef08a", col: "4 / 5", row: "3 / 7" },
  { name: "新宮市", seats: 1, color: "#bfdbfe", col: "5 / 6", row: "4 / 5" },
  { name: "西牟婁郡", seats: 2, color: "#fef3c7", col: "2 / 4", row: "6 / 7" },
  { name: "東牟婁郡", seats: 2, color: "#fbcfe8", col: "5 / 6", row: "5 / 7" },
];

type Props = {
  members: Member[];
  parties: string[];
  districts: string[];
};

function MemberCard({ m }: { m: Member }) {
  return (
    <Link
      href={`/members/${m.id}`}
      className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-wakayama-orange/50 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={m.photoUrl}
          alt={m.name}
          className="h-16 w-16 rounded-full border-2 border-slate-100 object-cover bg-slate-50"
        />
        <div className="flex-1 min-w-0">
          {m.role && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-wakayama-orange-dark">
              <Crown size={10} /> {m.role}
            </span>
          )}
          <p className="text-lg font-bold text-slate-900 group-hover:text-wakayama-orange transition-colors leading-tight">
            {m.name}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-600">
            <MapPin size={11} />
            <span>{m.district}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge variant="secondary">{m.party}</Badge>
        <Badge variant="outline">{m.age}歳</Badge>
      </div>
      <div className="mt-4 flex flex-wrap gap-1">
        {m.tags.slice(0, 3).map((t) => (
          <span
            key={t.label}
            className="text-[11px] px-2 py-0.5 rounded-full bg-wakayama-blue-soft text-wakayama-blue-dark"
          >
            #{t.label}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-end gap-1 text-xs font-semibold text-wakayama-blue group-hover:text-wakayama-orange transition-colors">
        詳細を見る <ArrowRight size={12} />
      </div>
    </Link>
  );
}

export function MembersExplorer({ members, parties, districts }: Props) {
  const [view, setView] = useState<"list" | "map">("list");
  const [query, setQuery] = useState("");
  const [party, setParty] = useState<string>("all");
  const [district, setDistrict] = useState<string>("all");
  const [age, setAge] = useState<AgeBand>("all");
  const [mapDistrict, setMapDistrict] = useState<string>("all");

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const q = query.trim();
      if (q && !m.name.includes(q)) return false;
      if (party !== "all" && m.party !== party) return false;
      if (district !== "all" && m.district !== district) return false;
      if (!inAgeBand(m.age, age)) return false;
      return true;
    });
  }, [members, query, party, district, age]);

  const anyFilter =
    query !== "" || party !== "all" || district !== "all" || age !== "all";

  const byDistrict = useMemo(() => {
    const map = new Map<string, Member[]>();
    for (const m of members) {
      const arr = map.get(m.district) ?? [];
      arr.push(m);
      map.set(m.district, arr);
    }
    return map;
  }, [members]);

  const shownDistricts =
    mapDistrict === "all"
      ? districtMeta
      : districtMeta.filter((d) => d.name === mapDistrict);

  return (
    <div>
      {/* View toggle */}
      <div className="mb-4 inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
        <button
          onClick={() => setView("list")}
          className={`inline-flex items-center gap-1.5 rounded-md px-4 h-9 text-sm font-semibold transition-colors ${
            view === "list"
              ? "bg-wakayama-orange text-white shadow-sm"
              : "text-slate-600 hover:text-wakayama-orange"
          }`}
        >
          <LayoutGrid size={14} /> 一覧ビュー
        </button>
        <button
          onClick={() => setView("map")}
          className={`inline-flex items-center gap-1.5 rounded-md px-4 h-9 text-sm font-semibold transition-colors ${
            view === "map"
              ? "bg-wakayama-orange text-white shadow-sm"
              : "text-slate-600 hover:text-wakayama-orange"
          }`}
        >
          <MapIcon size={14} /> マップビュー
        </button>
      </div>

      {view === "list" ? (
        <>
          {/* Filter panel */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Users2 size={16} className="text-wakayama-blue" />
              <p className="text-sm font-semibold text-slate-900">絞り込み</p>
              {anyFilter && (
                <button
                  onClick={() => {
                    setQuery("");
                    setParty("all");
                    setDistrict("all");
                    setAge("all");
                  }}
                  className="ml-auto inline-flex items-center gap-1 text-xs text-slate-500 hover:text-wakayama-orange"
                >
                  <X size={12} /> クリア
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="relative">
                <span className="sr-only">氏名で検索</span>
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="氏名を入力"
                  className="h-10 w-full rounded-md border border-slate-200 bg-white pl-8 pr-3 text-sm placeholder:text-slate-400 focus:border-wakayama-blue focus:outline-none focus:ring-2 focus:ring-wakayama-blue/20"
                />
              </label>

              <select
                value={party}
                onChange={(e) => setParty(e.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-wakayama-blue focus:outline-none focus:ring-2 focus:ring-wakayama-blue/20"
              >
                <option value="all">すべての会派</option>
                {parties.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-wakayama-blue focus:outline-none focus:ring-2 focus:ring-wakayama-blue/20"
              >
                <option value="all">すべての選挙区</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={age}
                onChange={(e) => setAge(e.target.value as AgeBand)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-wakayama-blue focus:outline-none focus:ring-2 focus:ring-wakayama-blue/20"
              >
                {ageBands.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              該当 <span className="font-bold text-slate-900">{filtered.length}</span> 名 / 全{" "}
              {members.length} 名
            </p>
          </div>

          {/* Member grid */}
          {filtered.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              条件に合う議員が見つかりませんでした。フィルターを調整してください。
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((m) => (
                <MemberCard key={m.id} m={m} />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Schematic map */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <MapIcon size={16} className="text-wakayama-blue" />
              <p className="text-sm font-semibold text-slate-900">
                選挙区マップ（模式図）
              </p>
              {mapDistrict !== "all" && (
                <button
                  onClick={() => setMapDistrict("all")}
                  className="ml-auto inline-flex items-center gap-1 text-xs text-slate-500 hover:text-wakayama-orange"
                >
                  <X size={12} /> 選択解除（全選挙区を表示）
                </button>
              )}
            </div>

            <div
              className="grid gap-1.5 sm:gap-2 mx-auto max-w-xl"
              style={{
                gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                gridTemplateRows: "repeat(6, minmax(56px, auto))",
              }}
              role="group"
              aria-label="選挙区を選択"
            >
              {districtMeta.map((d) => {
                const count = byDistrict.get(d.name)?.length ?? 0;
                const active = mapDistrict === d.name;
                return (
                  <button
                    key={d.name}
                    onClick={() =>
                      setMapDistrict(active ? "all" : d.name)
                    }
                    style={{
                      gridColumn: d.col,
                      gridRow: d.row,
                      backgroundColor: d.color,
                    }}
                    className={`rounded-lg p-1.5 sm:p-2 text-left transition-all border-2 flex flex-col justify-between min-w-0 ${
                      active
                        ? "border-wakayama-orange shadow-md scale-[1.02]"
                        : "border-transparent hover:border-wakayama-orange/60 hover:shadow-sm"
                    }`}
                  >
                    <span className="block text-[10px] sm:text-xs font-bold text-slate-800 leading-tight break-keep">
                      {d.name}
                    </span>
                    <span className="block text-[9px] sm:text-[11px] text-slate-600 mt-0.5">
                      {count}名
                      {d.vacancy ? (
                        <span className="text-rose-500">・欠{d.vacancy}</span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-[11px] text-slate-400 text-center">
              ※地理的な位置関係をもとにした模式図です（面積・形状は正確ではありません）。タイルをタップすると選挙区で絞り込めます。
            </p>
          </div>

          {/* Districts & members */}
          <div className="mt-8 space-y-10">
            {shownDistricts.map((d) => {
              const ms = byDistrict.get(d.name) ?? [];
              return (
                <section key={d.name} id={`district-${d.name}`}>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
                    <span
                      className="inline-block h-3.5 w-3.5 rounded-sm border border-black/10"
                      style={{ backgroundColor: d.color }}
                      aria-hidden
                    />
                    <h2 className="text-lg font-bold text-slate-900">
                      {d.name}選挙区
                    </h2>
                    <span className="text-xs text-slate-500">
                      定数{d.seats}人
                      {d.vacancy ? `（欠員${d.vacancy}・現員${ms.length}名）` : `・現員${ms.length}名`}
                    </span>
                  </div>
                  {ms.length === 0 ? (
                    <p className="text-sm text-slate-500">議員データがありません。</p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {ms.map((m) => (
                        <MemberCard key={m.id} m={m} />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          <p className="mt-8 text-[11px] text-slate-400">
            ※各選挙区内の掲載順は立候補届出順（和歌山県議会 議員名簿に準拠）。定数・欠員は令和8年6月10日現在。
          </p>
        </>
      )}
    </div>
  );
}
