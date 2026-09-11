"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, CATEGORY_KEYS, type CategoryKey } from "@/lib/categories";
import type { DamageMap, PhotoWithUrl } from "@/lib/types";
import PhotoEditDialog from "./PhotoEditDialog";
import PhotoEditorModal, { type DraftResult } from "./PhotoEditorModal";
import PhotoList, { sortPhotos, type SortKey } from "./PhotoList";

const DamageMapView = dynamic(() => import("./DamageMapView"), {
  ssr: false,
  loading: () => <div style={{ width: "100%", height: "100%" }} />,
});

const SIGNED_URL_TTL = 60 * 60 * 8; // 8時間

export default function MapWorkspace({
  map,
  initialPhotos,
  canEdit,
  headerRight,
}: {
  map: DamageMap;
  initialPhotos: PhotoWithUrl[];
  canEdit: boolean;
  headerRight?: React.ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [photos, setPhotos] = useState<PhotoWithUrl[]>(initialPhotos);
  const [queue, setQueue] = useState<File[]>([]);
  const [pendingLocation, setPendingLocation] = useState<PhotoWithUrl[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<CategoryKey>>(
    new Set(CATEGORY_KEYS),
  );
  const [sort, setSort] = useState<SortKey>("taken_desc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);


  const visiblePhotos = useMemo(
    () => sortPhotos(photos.filter((p) => activeCategories.has(p.category)), sort),
    [photos, activeCategories, sort],
  );

  const center: [number, number] = [map.center_lat, map.center_lng];

  function enqueue(files: File[]) {
    if (files.length === 0) return;
    setQueue((q) => [...q, ...files]);
  }

  async function handleSave(result: DraftResult) {
    setBusy(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("ログインが切れています。再度ログインしてください。");

      const key = crypto.randomUUID();
      const path = `${map.id}/${key}.jpg`;
      const thumbPath = `${map.id}/${key}_thumb.jpg`;

      const [upload, thumbUpload] = await Promise.all([
        supabase.storage
          .from("damage-photos")
          .upload(path, result.blob, { contentType: "image/jpeg" }),
        supabase.storage
          .from("damage-photos")
          .upload(thumbPath, result.thumbBlob, { contentType: "image/jpeg" }),
      ]);
      if (upload.error) throw upload.error;
      if (thumbUpload.error) throw thumbUpload.error;

      const inserted = await supabase
        .from("photos")
        .insert({
          map_id: map.id,
          image_path: path,
          thumb_path: thumbPath,
          lat: result.lat,
          lng: result.lng,
          category: result.category,
          caption: result.caption || null,
          taken_at: result.takenAt,
          file_name: result.fileName,
          width: result.width,
          height: result.height,
          created_by: user.id,
        })
        .select()
        .single();
      if (inserted.error) throw inserted.error;

      const { data: signed } = await supabase.storage
        .from("damage-photos")
        .createSignedUrls([path, thumbPath], SIGNED_URL_TTL);

      const signedByPath = new Map(
        (signed ?? []).map((entry) => [entry.path ?? "", entry.signedUrl]),
      );
      const url = signedByPath.get(path) ?? "";

      const photo = {
        ...inserted.data,
        url,
        thumbUrl: signedByPath.get(thumbPath) ?? url,
      } as PhotoWithUrl;

      setPhotos((prev) => [photo, ...prev]);
      if (photo.lat === null || photo.lng === null) {
        setPendingLocation((prev) => [...prev, photo]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setBusy(false);
      setQueue((q) => q.slice(1));
    }
  }

  async function handlePickLocation(lat: number, lng: number) {
    const target = pendingLocation[0];
    if (!target) return;
    setPendingLocation((prev) => prev.slice(1));
    setPhotos((prev) =>
      prev.map((p) => (p.id === target.id ? { ...p, lat, lng } : p)),
    );
    const { error: updateError } = await supabase
      .from("photos")
      .update({ lat, lng })
      .eq("id", target.id);
    if (updateError) setError(updateError.message);
  }

  async function handleUpdate(
    id: string,
    values: { category: CategoryKey; caption: string },
  ) {
    const previous = photos;
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, category: values.category, caption: values.caption || null }
          : p,
      ),
    );
    setEditingId(null);

    const { error: updateError } = await supabase
      .from("photos")
      .update({ category: values.category, caption: values.caption || null })
      .eq("id", id);

    if (updateError) {
      // 保存できなかったら画面を元に戻す
      setPhotos(previous);
      setError(updateError.message);
    }
  }

  async function handleDelete(id: string) {
    const target = photos.find((p) => p.id === id);
    if (!target) return;
    if (!confirm("この写真を削除します。元に戻せません。よろしいですか？")) return;

    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setPendingLocation((prev) => prev.filter((p) => p.id !== id));
    setEditingId((current) => (current === id ? null : current));
    const { error: deleteError } = await supabase
      .from("photos")
      .delete()
      .eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    await supabase.storage
      .from("damage-photos")
      .remove(
        [target.image_path, target.thumb_path].filter(
          (path): path is string => Boolean(path),
        ),
      );
  }

  function toggleCategory(key: CategoryKey) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const placedCount = photos.filter((p) => p.lat !== null).length;
  const editingPhoto = photos.find((p) => p.id === editingId) ?? null;

  return (
    <div className="workspace">
      <header className="site-header">
        <div>
          <h1>{map.title}</h1>
          <p>
            {map.description ||
              "現場写真のGPS情報から自動で地図に配置します。写真の上に直接書き込めます。"}
          </p>
        </div>
        <div className="header-actions">
          <span className="status-line">
            {photos.length} 枚 / 地図上 {placedCount} 枚
            {queue.length > 0 && ` ・ 残り ${queue.length} 枚`}
          </span>
          {canEdit && (
            <>
              {/*
                入力欄は hidden（display:none）にすると iOS Safari で
                JS からの click() が効かないことがある。画面外に置いたうえで
                label から開かせると、どの端末でも確実に反応する。
              */}
              <input
                id="camera-input"
                type="file"
                accept="image/*"
                capture="environment"
                className="visually-hidden"
                onChange={(e) => {
                  // input.value を消すと同じ FileList がその場で空になる。
                  // setQueue の更新関数は後から動くので、先に配列へ写しておく。
                  const files = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  enqueue(files);
                }}
              />
              <input
                id="pick-input"
                type="file"
                accept="image/*"
                multiple
                className="visually-hidden"
                onChange={(e) => {
                  // input.value を消すと同じ FileList がその場で空になる。
                  // setQueue の更新関数は後から動くので、先に配列へ写しておく。
                  const files = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  enqueue(files);
                }}
              />
              <label htmlFor="pick-input" className="btn desktop-only">
                写真をアップロード
              </label>
            </>
          )}
          {headerRight}
        </div>
      </header>

      {error && (
        <div className="notice error" style={{ margin: "10px 16px 0" }}>
          {error}
        </div>
      )}

      {pendingLocation.length > 0 && (
        <div className="banner">
          <span>
            「{pendingLocation[0].file_name}」の場所を地図上でタップして指定してください（残り
            {pendingLocation.length}件）
          </span>
          <button
            type="button"
            className="btn secondary small"
            onClick={() => setPendingLocation((prev) => prev.slice(1))}
          >
            この写真は地図に置かない
          </button>
        </div>
      )}

      <div className="workspace-main">
        <div className="workspace-map">
          <DamageMapView
            photos={visiblePhotos}
            center={center}
            zoom={map.zoom}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onPickLocation={canEdit ? handlePickLocation : undefined}
            pickMode={pendingLocation.length > 0}
          />
        </div>

        <aside className="workspace-aside">
          <div className="legend aside-legend">
            {CATEGORY_KEYS.map((key) => (
              <span key={key}>
                <i style={{ background: CATEGORIES[key].color }} />
                {CATEGORIES[key].label}
              </span>
            ))}
          </div>
          <PhotoList
            photos={visiblePhotos}
            allPhotos={photos}
            selectedId={selectedId}
            onSelect={setSelectedId}
            activeCategories={activeCategories}
            onToggleCategory={toggleCategory}
            sort={sort}
            onSortChange={setSort}
            onDelete={canEdit ? handleDelete : undefined}
            onEdit={canEdit ? setEditingId : undefined}
            canEdit={canEdit}
          />
        </aside>
      </div>

      {canEdit && (
        <div className="mobile-actions">
          <label htmlFor="camera-input" className="btn">
            写真を撮る
          </label>
          <label htmlFor="pick-input" className="btn secondary">
            写真を選ぶ
          </label>
        </div>
      )}

      {canEdit && editingPhoto && (
        <PhotoEditDialog
          photo={editingPhoto}
          onClose={() => setEditingId(null)}
          onSave={(values) => handleUpdate(editingPhoto.id, values)}
          onRelocate={() => {
            // 地図クリック待ちの先頭に入れて、そのまま指定してもらう
            setPendingLocation((prev) => [
              editingPhoto,
              ...prev.filter((p) => p.id !== editingPhoto.id),
            ]);
            setEditingId(null);
          }}
        />
      )}

      {canEdit && queue.length > 0 && (
        <PhotoEditorModal
          key={`${queue[0].name}-${queue[0].lastModified}-${queue.length}`}
          file={queue[0]}
          remaining={queue.length - 1}
          onSave={handleSave}
          onSkip={() => !busy && setQueue((q) => q.slice(1))}
        />
      )}
    </div>
  );
}

