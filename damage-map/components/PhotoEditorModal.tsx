"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CATEGORY_KEYS, CATEGORIES, type CategoryKey } from "@/lib/categories";

export type DraftResult = {
  blob: Blob;
  /** 一覧表示用の軽い画像 */
  thumbBlob: Blob;
  width: number;
  height: number;
  lat: number | null;
  lng: number | null;
  takenAt: string | null;
  category: CategoryKey;
  caption: string;
  fileName: string;
};

type Draft = {
  file: File;
  objectUrl: string;
  width: number;
  height: number;
  lat: number | null;
  lng: number | null;
  takenAt: string | null;
};

type Stroke = { color: string; points: { x: number; y: number }[] };

const MAX_WIDTH = 1200;
const THUMB_WIDTH = 400;
const PEN_COLORS = ["#23281F", "#B8461D", "#37647F"];

/** Exif の向きを反映しつつ、長辺を MAX_WIDTH に収めた canvas を作る */
async function normalizeImage(file: File) {
  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    source = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
  const naturalW = "width" in source ? source.width : 0;
  const naturalH = "height" in source ? source.height : 0;
  const scale = Math.min(1, MAX_WIDTH / naturalW);
  const width = Math.round(naturalW * scale);
  const height = Math.round(naturalH * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(source, 0, 0, width, height);
  if ("close" in source) source.close();
  return { canvas, width, height };
}

export default function PhotoEditorModal({
  file,
  remaining,
  onSave,
  onSkip,
}: {
  file: File;
  remaining: number;
  onSave: (result: DraftResult) => void;
  onSkip: () => void;
}) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [category, setCategory] = useState<CategoryKey>("road");
  const [caption, setCaption] = useState("");
  const [penColor, setPenColor] = useState(PEN_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const penColorRef = useRef(penColor);

  useEffect(() => {
    penColorRef.current = penColor;
  }, [penColor]);

  // ファイルが変わるたびに Exif を読み、画像とキャンバスを組み直す
  useEffect(() => {
    let cancelled = false;
    let createdUrl: string | null = null;

    (async () => {
      const exifr = (await import("exifr")).default;
      const [meta, normalized] = await Promise.all([
        // pick を指定すると GPS ブロックごと除外されてしまうので使わない
        exifr.parse(file, { gps: true }).catch(() => null),
        normalizeImage(file),
      ]);
      if (cancelled) return;

      baseCanvasRef.current = normalized.canvas;
      strokesRef.current = [];
      currentStrokeRef.current = null;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = normalized.width;
        canvas.height = normalized.height;
        canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
      }

      const taken: Date | undefined = meta?.DateTimeOriginal ?? meta?.CreateDate;
      createdUrl = normalized.canvas.toDataURL("image/jpeg", 0.9);

      setDraft({
        file,
        objectUrl: createdUrl,
        width: normalized.width,
        height: normalized.height,
        lat: typeof meta?.latitude === "number" ? meta.latitude : null,
        lng: typeof meta?.longitude === "number" ? meta.longitude : null,
        takenAt: taken ? new Date(taken).toISOString() : null,
      });
      setCategory("road");
      setCaption("");
      setPenColor(PEN_COLORS[0]);
    })();

    return () => {
      cancelled = true;
    };
  }, [file]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = Math.max(4, canvas.width / 200);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const stroke of strokesRef.current) {
      if (stroke.points.length < 2) continue;
      ctx.strokeStyle = stroke.color;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (const p of stroke.points) ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
  }, []);

  const posOf = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    currentStrokeRef.current = {
      color: penColorRef.current,
      points: [posOf(e)],
    };
    strokesRef.current.push(currentStrokeRef.current);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!currentStrokeRef.current) return;
    e.preventDefault();
    currentStrokeRef.current.points.push(posOf(e));
    redraw();
  };

  const handlePointerUp = () => {
    currentStrokeRef.current = null;
  };

  async function handleSave() {
    if (!draft || !baseCanvasRef.current || saving) return;
    setSaving(true);

    const composite = document.createElement("canvas");
    composite.width = draft.width;
    composite.height = draft.height;
    const ctx = composite.getContext("2d")!;
    ctx.drawImage(baseCanvasRef.current, 0, 0);
    if (canvasRef.current) ctx.drawImage(canvasRef.current, 0, 0);

    // 一覧用に縮小したものも作る。原寸を88px枠に読ませると写真が増えるほど重くなる
    const thumb = document.createElement("canvas");
    const thumbScale = Math.min(1, THUMB_WIDTH / draft.width);
    thumb.width = Math.round(draft.width * thumbScale);
    thumb.height = Math.round(draft.height * thumbScale);
    thumb
      .getContext("2d")!
      .drawImage(composite, 0, 0, thumb.width, thumb.height);

    const [blob, thumbBlob] = await Promise.all([
      new Promise<Blob | null>((resolve) =>
        composite.toBlob(resolve, "image/jpeg", 0.85),
      ),
      new Promise<Blob | null>((resolve) =>
        thumb.toBlob(resolve, "image/jpeg", 0.7),
      ),
    ]);
    if (!blob || !thumbBlob) {
      setSaving(false);
      return;
    }

    onSave({
      blob,
      thumbBlob,
      width: draft.width,
      height: draft.height,
      lat: draft.lat,
      lng: draft.lng,
      takenAt: draft.takenAt,
      category,
      caption: caption.trim(),
      fileName: file.name,
    });
    setSaving(false);
  }

  return (
    <div className="overlay">
      <div className="modal">
        <h2>写真に書き込む</h2>
        <div className="fname">
          {file.name}
          {remaining > 0 && ` ・ 残り ${remaining} 枚`}
        </div>

        {!draft && <p className="empty-note">写真を読み込んでいます…</p>}

        {draft && (
          <>
            {draft.lat === null && (
              <p className="notice" style={{ marginBottom: 12 }}>
                この写真には位置情報がありません。保存すると、あとで地図をクリックして場所を指定できます。
              </p>
            )}

            <div
              className="canvas-wrap"
              style={{ aspectRatio: `${draft.width} / ${draft.height}` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={draft.objectUrl} alt="" />
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              />
            </div>

            <div className="pen-controls">
              <label>
                ペン色
                {PEN_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`ペン色 ${color}`}
                    className={`swatch${penColor === color ? " active" : ""}`}
                    style={{ background: color }}
                    onClick={() => setPenColor(color)}
                  />
                ))}
              </label>
              <button
                type="button"
                className="btn secondary small"
                onClick={() => {
                  strokesRef.current.pop();
                  redraw();
                }}
              >
                一つ戻す
              </button>
              <button
                type="button"
                className="btn secondary small"
                onClick={() => {
                  strokesRef.current = [];
                  redraw();
                }}
              >
                全部消す
              </button>
            </div>

            <div className="field-row">
              <label htmlFor="category">被害の種類</label>
              <select
                id="category"
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
              <label htmlFor="caption">キャプション（任意）</label>
              <textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="一覧に表示する短いメモ"
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn secondary" onClick={onSkip}>
                この写真は使わない
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "保存中…" : "保存して次へ"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
