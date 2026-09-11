"use client";

import { CATEGORIES, CATEGORY_KEYS, categoryOf, type CategoryKey } from "@/lib/categories";
import type { PhotoWithUrl } from "@/lib/types";

export type SortKey = "taken_desc" | "taken_asc" | "added_desc" | "category";

export function sortPhotos(photos: PhotoWithUrl[], sort: SortKey) {
  const time = (p: PhotoWithUrl) =>
    new Date(p.taken_at ?? p.created_at).getTime();
  const copy = [...photos];
  switch (sort) {
    case "taken_asc":
      return copy.sort((a, b) => time(a) - time(b));
    case "taken_desc":
      return copy.sort((a, b) => time(b) - time(a));
    case "category":
      return copy.sort(
        (a, b) =>
          CATEGORY_KEYS.indexOf(a.category) - CATEGORY_KEYS.indexOf(b.category) ||
          time(b) - time(a),
      );
    case "added_desc":
    default:
      return copy.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }
}

function formatDate(photo: PhotoWithUrl) {
  const value = photo.taken_at ?? photo.created_at;
  if (!value) return "";
  return new Date(value).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PhotoList({
  photos,
  allPhotos,
  selectedId,
  onSelect,
  activeCategories,
  onToggleCategory,
  sort,
  onSortChange,
  onDelete,
  onEdit,
  canEdit,
}: {
  photos: PhotoWithUrl[];
  allPhotos: PhotoWithUrl[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  activeCategories: Set<CategoryKey>;
  onToggleCategory: (key: CategoryKey) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  canEdit: boolean;
}) {
  const counts = CATEGORY_KEYS.reduce(
    (acc, key) => {
      acc[key] = allPhotos.filter((p) => p.category === key).length;
      return acc;
    },
    {} as Record<CategoryKey, number>,
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: 10,
        }}
      >
        {CATEGORY_KEYS.map((key) => {
          const active = activeCategories.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onToggleCategory(key)}
              style={{
                fontFamily: "inherit",
                fontSize: 11.5,
                padding: "4px 9px",
                cursor: "pointer",
                border: `1.5px solid ${CATEGORIES[key].color}`,
                background: active ? CATEGORIES[key].color : "transparent",
                color: active ? "#fff" : "var(--ink-soft)",
              }}
            >
              {CATEGORIES[key].label} {counts[key]}
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
          paddingBottom: 12,
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <label
          htmlFor="sort"
          style={{ fontSize: 11.5, color: "var(--ink-soft)", whiteSpace: "nowrap" }}
        >
          並び順
        </label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          style={{ fontSize: 13 }}
        >
          <option value="taken_desc">撮影日時が新しい順</option>
          <option value="taken_asc">撮影日時が古い順</option>
          <option value="added_desc">登録が新しい順</option>
          <option value="category">被害の種類別</option>
        </select>
      </div>

      {photos.length === 0 ? (
        <p className="empty-note">
          {allPhotos.length === 0
            ? "まだ写真がありません。「写真をアップロード」から現場写真を選んでください。位置情報が入っていれば自動で地図にピンが立ちます。"
            : "この絞り込みに該当する写真はありません。"}
        </p>
      ) : (
        photos.map((photo) => {
          const cat = categoryOf(photo.category);
          return (
            <div key={photo.id} style={{ position: "relative" }}>
              <button
                type="button"
                className={`card${photo.id === selectedId ? " active" : ""}`}
                onClick={() => onSelect(photo.id)}
              >
                {photo.thumbUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.thumbUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span
                    className="card-thumb-empty"
                    aria-hidden
                    title="画像を読み込めませんでした"
                  />
                )}
                <div className="card-body">
                  <div className="card-top">
                    {photo.seq !== null && (
                      <span className="seq-badge">No.{photo.seq}</span>
                    )}
                    <span className="tag" style={{ background: cat.color }}>
                      {cat.label}
                    </span>
                    <span className="card-time">{formatDate(photo)}</span>
                  </div>
                  <p
                    className="card-caption"
                    style={photo.caption ? undefined : { color: "#9a9484" }}
                  >
                    {photo.caption || "（キャプションなし）"}
                  </p>
                  <span className="card-latlng">
                    {photo.lat !== null && photo.lng !== null
                      ? `${photo.lat.toFixed(5)}, ${photo.lng.toFixed(5)}`
                      : "位置未指定"}
                  </span>
                </div>
              </button>
              {canEdit && (
                <div
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    display: "flex",
                    gap: 4,
                  }}
                >
                  {onEdit && (
                    <button
                      type="button"
                      aria-label="この写真を編集"
                      onClick={() => onEdit(photo.id)}
                      className="card-action"
                    >
                      編集
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      aria-label="この写真を削除"
                      onClick={() => onDelete(photo.id)}
                      className="card-action"
                    >
                      削除
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
