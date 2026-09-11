import type { CategoryKey } from "./categories";

export type DamageMap = {
  id: string;
  title: string;
  description: string | null;
  center_lat: number;
  center_lng: number;
  zoom: number;
  owner_id: string;
  created_at: string;
};

export type Photo = {
  id: string;
  map_id: string;
  image_path: string;
  /** 一覧・ポップアップ用の軽い画像。原寸は image_path */
  thumb_path: string | null;
  lat: number | null;
  lng: number | null;
  category: CategoryKey;
  caption: string | null;
  taken_at: string | null;
  file_name: string | null;
  width: number | null;
  height: number | null;
  /** 案件ごとの通し番号。相談書の写真番号と地図のピン番号はこれで一致する */
  seq: number | null;
  created_by: string | null;
  created_at: string;
};

/** 画像の署名付きURLを添えた写真 */
export type PhotoWithUrl = Photo & {
  /** 原寸（相談書・拡大表示用） */
  url: string;
  /** 一覧・ポップアップ用。サムネイル未生成の写真では url と同じ */
  thumbUrl: string;
};

export type MapRole = "owner" | "editor" | "viewer";
