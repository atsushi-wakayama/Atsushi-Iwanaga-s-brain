"use client";

import { useState } from "react";
import { CATEGORIES, CATEGORY_KEYS, type CategoryKey } from "@/lib/categories";
import type { PhotoWithUrl } from "@/lib/types";

export default function PhotoEditDialog({
  photo,
  onSave,
  onRelocate,
  onClose,
}: {
  photo: PhotoWithUrl;
  onSave: (values: { category: CategoryKey; caption: string }) => Promise<void>;
  onRelocate: () => void;
  onClose: () => void;
}) {
  const [category, setCategory] = useState<CategoryKey>(photo.category);
  const [caption, setCaption] = useState(photo.caption ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    await onSave({ category, caption: caption.trim() });
    setSaving(false);
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 460 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>写真の情報を編集</h2>
        <div className="fname">
          No.{photo.seq ?? "―"}　{photo.file_name}
        </div>

        {photo.thumbUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.thumbUrl}
            alt=""
            style={{
              display: "block",
              width: "100%",
              maxHeight: 220,
              objectFit: "contain",
              border: "1px solid var(--rule)",
              background: "#000",
              marginBottom: 14,
            }}
          />
        )}

        <div className="field-row">
          <label htmlFor="edit-category">被害の種類</label>
          <select
            id="edit-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryKey)}
          >
            {CATEGORY_KEYS.map((key) => (
              <option key={key} value={key}>
                {CATEGORIES[key].label}
              </option>
            ))}
          </select>
        </div>

        <div className="field-row">
          <label htmlFor="edit-caption">キャプション</label>
          <textarea
            id="edit-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
            placeholder="一覧や相談書に表示される説明"
          />
        </div>

        <div className="field-row" style={{ marginBottom: 0 }}>
          <label>場所</label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
              {photo.lat !== null && photo.lng !== null
                ? `${photo.lat.toFixed(5)}, ${photo.lng.toFixed(5)}`
                : "位置未指定"}
            </span>
            <button
              type="button"
              className="btn secondary small"
              onClick={onRelocate}
            >
              地図で指定し直す
            </button>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn secondary" onClick={onClose}>
            キャンセル
          </button>
          <button
            type="button"
            className="btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "保存中…" : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
