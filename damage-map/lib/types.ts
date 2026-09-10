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
  lat: number | null;
  lng: number | null;
  category: CategoryKey;
  caption: string | null;
  taken_at: string | null;
  file_name: string | null;
  width: number | null;
  height: number | null;
  created_by: string | null;
  created_at: string;
};

/** 画像の署名付きURLを添えた写真 */
export type PhotoWithUrl = Photo & { url: string };

export type MapRole = "owner" | "editor" | "viewer";
