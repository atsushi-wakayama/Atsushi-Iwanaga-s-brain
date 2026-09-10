import type { SupabaseClient } from "@supabase/supabase-js";
import type { Photo, PhotoWithUrl } from "./types";

export const SIGNED_URL_TTL = 60 * 60 * 8; // 8時間

/** 写真レコードに署名付きURLを添える（Storage は非公開バケット） */
export async function withSignedUrls(
  supabase: SupabaseClient,
  photos: Photo[],
): Promise<PhotoWithUrl[]> {
  if (photos.length === 0) return [];

  // 原寸とサムネイルをまとめて1回で署名する（往復を増やさない）
  const paths = [
    ...new Set([
      ...photos.map((p) => p.image_path),
      ...photos.map((p) => p.thumb_path).filter((p): p is string => Boolean(p)),
    ]),
  ];

  const { data } = await supabase.storage
    .from("damage-photos")
    .createSignedUrls(paths, SIGNED_URL_TTL);

  const urlByPath = new Map(
    (data ?? []).map((entry) => [entry.path ?? "", entry.signedUrl]),
  );

  return photos.map((photo) => {
    const url = urlByPath.get(photo.image_path) ?? "";
    return {
      ...photo,
      url,
      // サムネイル未生成の古い写真は原寸で代用する
      thumbUrl: (photo.thumb_path && urlByPath.get(photo.thumb_path)) || url,
    };
  });
}
