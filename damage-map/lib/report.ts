import type { PhotoWithUrl } from "./types";

/** 2019年以降を前提に和暦へ直す（公文書の書式に合わせる） */
export function toWareki(date: Date) {
  const year = date.getFullYear() - 2018;
  const era = year === 1 ? "元" : String(year);
  return `令和${era}年${date.getMonth() + 1}月${date.getDate()}日`;
}

export function formatDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return `${toWareki(date)} ${String(date.getHours()).padStart(2, "0")}時${String(
    date.getMinutes(),
  ).padStart(2, "0")}分`;
}

/** 写真の撮影日時の範囲から、発生日時欄の初期値を組み立てる */
export function defaultOccurredAt(photos: PhotoWithUrl[]) {
  const times = photos
    .map((p) => p.taken_at)
    .filter((t): t is string => Boolean(t))
    .map((t) => new Date(t).getTime())
    .sort((a, b) => a - b);
  if (times.length === 0) return "";

  const first = new Date(times[0]);
  const last = new Date(times[times.length - 1]);
  const sameDay = first.toDateString() === last.toDateString();
  if (sameDay && times.length === 1) return formatDateTime(first.toISOString());
  if (sameDay) {
    return `${toWareki(first)} ${String(first.getHours()).padStart(2, "0")}時${String(
      first.getMinutes(),
    ).padStart(2, "0")}分頃から ${String(last.getHours()).padStart(2, "0")}時${String(
      last.getMinutes(),
    ).padStart(2, "0")}分頃まで`;
  }
  return `${toWareki(first)}から${toWareki(last)}まで`;
}

export type ReportFields = {
  recipient: string;
  issuedOn: string;
  senderName: string;
  senderContact: string;
  occurredAt: string;
  place: string;
  summary: string;
  title: string;
};

export type PhotoEntry = {
  photo: PhotoWithUrl;
  address: string;
  include: boolean;
};
