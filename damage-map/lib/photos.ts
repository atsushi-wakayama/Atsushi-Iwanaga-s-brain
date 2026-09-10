import type { SupabaseClient } from "@supabase/supabase-js";
import type { Photo, PhotoWithUrl } from "./types";

export const SIGNED_URL_TTL = 60 * 60 * 8; // 8時間

/** 写真レコードに署名付きURLを添える（Storage は非公開バケット） */
export async function withSignedUrls(
  supabase: SupabaseClient,
  photos: Photo[],
): Promise<PhotoWithUrl[]> {
  if (photos.length === 0) return [];

  const { data } = await supabase.storage
    .from("damage-photos")
    .createSignedUrls(
      photos.map((p) => p.image_path),
      SIGNED_URL_TTL,
    );

  const urlByPath = new Map(
    (data ?? []).map((entry) => [entry.path ?? "", entry.signedUrl]),
  );

  return photos.map((photo) => ({
    ...photo,
    url: urlByPath.get(photo.image_path) ?? "",
  }));
}
