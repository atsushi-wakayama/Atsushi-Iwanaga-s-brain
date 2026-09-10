"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { categoryOf } from "@/lib/categories";
import {
  defaultOccurredAt,
  formatDateTime,
  toWareki,
  type PhotoEntry,
  type ReportFields,
} from "@/lib/report";
import type { DamageMap, PhotoWithUrl } from "@/lib/types";

export default function ReportBuilder({
  map,
  photos,
}: {
  map: DamageMap;
  photos: PhotoWithUrl[];
}) {
  const [fields, setFields] = useState<ReportFields>(() => ({
    recipient: "日高振興局　建設部　御中",
    issuedOn: new Date().toISOString().slice(0, 10),
    senderName: "和歌山県議会議員　",
    senderContact: "",
    occurredAt: defaultOccurredAt(photos),
    place: "",
    summary: "",
    title: "ご相談書",
  }));

  const [entries, setEntries] = useState<PhotoEntry[]>(() =>
    photos.map((photo) => ({ photo, address: "", include: true })),
  );
  // 座標つきの写真があるなら、初回描画の時点ですでに取得中
  const [geocoding, setGeocoding] = useState(() =>
    photos.some((p) => p.lat !== null && p.lng !== null),
  );
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 座標のある写真の所在地を地理院の逆ジオコーダで引く
  useEffect(() => {
    const targets = photos.filter((p) => p.lat !== null && p.lng !== null);
    if (targets.length === 0) return;

    let cancelled = false;

    (async () => {
      const resolved = new Map<string, string>();
      for (const photo of targets) {
        try {
          const response = await fetch(
            `/api/reverse-geocode?lat=${photo.lat}&lon=${photo.lng}`,
          );
          const json = (await response.json()) as { address: string | null };
          if (json.address) resolved.set(photo.id, json.address);
        } catch {
          // 引けなかった写真は空欄のままにして、手入力で補ってもらう
        }
      }
      if (cancelled) return;

      setEntries((prev) =>
        prev.map((entry) => ({
          ...entry,
          address: entry.address || (resolved.get(entry.photo.id) ?? ""),
        })),
      );
      // 場所欄の初期値は、写真の所在地から重複を除いて組み立てる
      setFields((prev) => {
        if (prev.place) return prev;
        const unique = [...new Set(resolved.values())];
        if (unique.length === 0) return prev;
        return {
          ...prev,
          place: unique.length <= 2 ? unique.join("、") : `${unique[0]} ほか${unique.length - 1}箇所`,
        };
      });
      setGeocoding(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [photos]);

  const selected = useMemo(() => entries.filter((e) => e.include), [entries]);
  const issuedLabel = useMemo(() => {
    const date = new Date(`${fields.issuedOn}T00:00:00`);
    return Number.isNaN(date.getTime()) ? fields.issuedOn : toWareki(date);
  }, [fields.issuedOn]);

  function update<K extends keyof ReportFields>(key: K, value: ReportFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function downloadWord() {
    if (building) return;
    setBuilding(true);
    setError(null);
    try {
      const { buildReportDocx } = await import("@/lib/docx");
      const blob = await buildReportDocx({
        fields,
        issuedLabel,
        entries: selected,
        mapTitle: map.title,
      });

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${fields.title}_${map.title}_${fields.issuedOn}.docx`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Word文書の作成に失敗しました",
      );
    } finally {
      setBuilding(false);
    }
  }

  return (
    <div className="report-screen">
      <header className="site-header no-print">
        <div>
          <h1>相談書・陳情書の作成</h1>
          <p>{map.title}</p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn"
            onClick={downloadWord}
            disabled={building || selected.length === 0}
          >
            {building ? "作成中…" : "Wordでダウンロード"}
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => window.print()}
          >
            印刷 / PDFで保存
          </button>
          <Link href={`/m/${map.id}`} className="btn secondary small">
            地図に戻る
          </Link>
        </div>
      </header>

      {error && (
        <div className="notice error no-print" style={{ margin: "10px 16px 0" }}>
          {error}
        </div>
      )}

      <div className="report-layout">
        <aside className="report-form no-print">
          <div className="field-row">
            <label htmlFor="title">表題</label>
            <input
              id="title"
              type="text"
              value={fields.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>
          <div className="field-row">
            <label htmlFor="recipient">宛先</label>
            <input
              id="recipient"
              type="text"
              value={fields.recipient}
              onChange={(e) => update("recipient", e.target.value)}
            />
          </div>
          <div className="field-row">
            <label htmlFor="issuedOn">作成日</label>
            <input
              id="issuedOn"
              type="date"
              value={fields.issuedOn}
              onChange={(e) => update("issuedOn", e.target.value)}
            />
          </div>
          <div className="field-row">
            <label htmlFor="senderName">差出人</label>
            <input
              id="senderName"
              type="text"
              value={fields.senderName}
              onChange={(e) => update("senderName", e.target.value)}
            />
          </div>
          <div className="field-row">
            <label htmlFor="senderContact">連絡先</label>
            <input
              id="senderContact"
              type="text"
              value={fields.senderContact}
              onChange={(e) => update("senderContact", e.target.value)}
              placeholder="電話番号・メールアドレスなど"
            />
          </div>

          <hr style={{ border: 0, borderTop: "1px solid var(--rule)", margin: "18px 0" }} />

          <div className="field-row">
            <label htmlFor="occurredAt">① 発生日時</label>
            <input
              id="occurredAt"
              type="text"
              value={fields.occurredAt}
              onChange={(e) => update("occurredAt", e.target.value)}
              placeholder="写真の撮影日時から自動で入ります"
            />
          </div>
          <div className="field-row">
            <label htmlFor="place">② 場所</label>
            <input
              id="place"
              type="text"
              value={fields.place}
              onChange={(e) => update("place", e.target.value)}
              placeholder={geocoding ? "所在地を取得しています…" : "所在地"}
            />
          </div>
          <div className="field-row">
            <label htmlFor="summary">③ 概要</label>
            <textarea
              id="summary"
              value={fields.summary}
              onChange={(e) => update("summary", e.target.value)}
              rows={7}
              placeholder="被害の状況、想定される影響、要望内容など"
            />
          </div>

          <h2 style={{ fontSize: 14, margin: "18px 0 8px" }}>
            ④ 掲載する写真（{selected.length} / {entries.length} 枚）
          </h2>
          {entries.map((entry, index) => (
            <div key={entry.photo.id} className="report-pick">
              <label>
                <input
                  type="checkbox"
                  checked={entry.include}
                  onChange={(e) =>
                    setEntries((prev) =>
                      prev.map((item, i) =>
                        i === index ? { ...item, include: e.target.checked } : item,
                      ),
                    )
                  }
                />
                <span>
                  No.{entry.photo.seq ?? index + 1} ・{" "}
                  {categoryOf(entry.photo.category).label}
                </span>
              </label>
              <input
                type="text"
                value={entry.address}
                onChange={(e) =>
                  setEntries((prev) =>
                    prev.map((item, i) =>
                      i === index ? { ...item, address: e.target.value } : item,
                    ),
                  )
                }
                placeholder="所在地"
                style={{ fontSize: 12.5, padding: "5px 8px" }}
              />
            </div>
          ))}
        </aside>

        <div className="report-preview-wrap">
          <ReportDocument
            fields={fields}
            issuedLabel={issuedLabel}
            entries={selected}
          />
        </div>
      </div>
    </div>
  );
}

function ReportDocument({
  fields,
  issuedLabel,
  entries,
}: {
  fields: ReportFields;
  issuedLabel: string;
  entries: PhotoEntry[];
}) {
  const range =
    entries.length === 0
      ? ""
      : entries.length === 1
        ? `No.${entries[0].photo.seq ?? 1}`
        : `No.${entries[0].photo.seq ?? 1}〜No.${entries[entries.length - 1].photo.seq ?? entries.length}`;

  return (
    <>
      <article className="sheet">
        <p className="doc-date">{issuedLabel}</p>
        <p className="doc-recipient">{fields.recipient}</p>
        <div className="doc-sender">
          <p>{fields.senderName}</p>
          {fields.senderContact && <p>連絡先：{fields.senderContact}</p>}
        </div>

        <h1 className="doc-title">{fields.title}</h1>

        <p className="doc-lead">
          　標記について、下記のとおり現地を確認いたしましたので、ご相談申し上げます。
        </p>
        <p className="doc-ki">記</p>

        <dl className="doc-items">
          <dt>１　発生日時</dt>
          <dd>{fields.occurredAt || "―"}</dd>
          <dt>２　場所</dt>
          <dd>{fields.place || "―"}</dd>
          <dt>３　概要</dt>
          <dd className="doc-summary">{fields.summary || "―"}</dd>
          <dt>４　現地写真</dt>
          <dd>
            {entries.length === 0
              ? "―"
              : `別紙のとおり（${range}　計${entries.length}枚）`}
          </dd>
        </dl>

        <p className="doc-end">以上</p>
      </article>

      {chunk(entries, 2).map((group, pageIndex) => (
        <article className="sheet" key={pageIndex}>
          {pageIndex === 0 && <h2 className="doc-appendix-title">別紙　現地写真</h2>}
          {group.map((entry, index) => (
            <PhotoBlock
              key={entry.photo.id}
              entry={entry}
              fallbackNumber={pageIndex * 2 + index + 1}
            />
          ))}
        </article>
      ))}
    </>
  );
}

function PhotoBlock({
  entry,
  fallbackNumber,
}: {
  entry: PhotoEntry;
  fallbackNumber: number;
}) {
  const { photo } = entry;
  const cat = categoryOf(photo.category);
  return (
    <section className="photo-block">
      <h3>
        No.{photo.seq ?? fallbackNumber}　{cat.label}
      </h3>
      <table className="photo-meta">
        <tbody>
          <tr>
            <th>所在地</th>
            <td>{entry.address || "―"}</td>
          </tr>
          <tr>
            <th>撮影日時</th>
            <td>{formatDateTime(photo.taken_at) || "―"}</td>
          </tr>
          <tr>
            <th>座標</th>
            <td>
              {photo.lat !== null && photo.lng !== null
                ? `北緯 ${photo.lat.toFixed(5)} / 東経 ${photo.lng.toFixed(5)}`
                : "―"}
            </td>
          </tr>
        </tbody>
      </table>
      {photo.url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo.url} alt="" className="photo-figure" />
      )}
      <p className="photo-caption">{photo.caption || "（キャプションなし）"}</p>
    </section>
  );
}

function chunk<T>(items: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
