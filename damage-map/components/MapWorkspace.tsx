"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, CATEGORY_KEYS, type CategoryKey } from "@/lib/categories";
import type { DamageMap, PhotoWithUrl } from "@/lib/types";
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
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pickInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);

  const visiblePhotos = useMemo(
    () => sortPhotos(photos.filter((p) => activeCategories.has(p.category)), sort),
    [photos, activeCategories, sort],
  );

  const center: [number, number] = [map.center_lat, map.center_lng];

  function enqueue(fileList: FileList | null) {
    if (!fileList?.length) return;
    setQueue((q) => [...q, ...Array.from(fileList)]);
  }

  async function handleSave(result: DraftResult) {
    setBusy(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("ログインが切れています。再度ログインしてください。");

      const path = `${map.id}/${crypto.randomUUID()}.jpg`;
      const upload = await supabase.storage
        .from("damage-photos")
        .upload(path, result.blob, { contentType: "image/jpeg" });
      if (upload.error) throw upload.error;

      const inserted = await supabase
        .from("photos")
        .insert({
          map_id: map.id,
          image_path: path,
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

      const signed = await supabase.storage
        .from("damage-photos")
        .createSignedUrl(path, SIGNED_URL_TTL);

      const photo = {
        ...inserted.data,
        url: signed.data?.signedUrl ?? "",
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

  async function handleDelete(id: string) {
    const target = photos.find((p) => p.id === id);
    if (!target) return;
    if (!confirm("この写真を削除します。元に戻せません。よろしいですか？")) return;

    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setPendingLocation((prev) => prev.filter((p) => p.id !== id));
    const { error: deleteError } = await supabase
      .from("photos")
      .delete()
      .eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    await supabase.storage.from("damage-photos").remove([target.image_path]);
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
              <input
                ref={cameraInput}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={(e) => {
                  enqueue(e.target.files);
                  e.target.value = "";
                }}
              />
              <input
                ref={pickInput}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  enqueue(e.target.files);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                className="btn desktop-only"
                onClick={() => pickInput.current?.click()}
              >
                写真をアップロード
              </button>
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
            canEdit={canEdit}
          />
        </aside>
      </div>

      {canEdit && (
        <div className="mobile-actions">
          <button
            type="button"
            className="btn"
            onClick={() => cameraInput.current?.click()}
          >
            写真を撮る
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => pickInput.current?.click()}
          >
            写真を選ぶ
          </button>
        </div>
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

