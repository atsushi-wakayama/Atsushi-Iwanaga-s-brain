"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { categoryOf } from "@/lib/categories";
import type { PhotoWithUrl } from "@/lib/types";

type Props = {
  photos: PhotoWithUrl[];
  center: [number, number];
  zoom: number;
  selectedId: string | null;
  onSelect?: (id: string) => void;
  /** 位置未指定の写真に座標を与えるモード。クリック地点を返す */
  onPickLocation?: (lat: number, lng: number) => void;
  pickMode?: boolean;
};

function escapeHtml(str: string) {
  return str.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function popupHtml(photo: PhotoWithUrl) {
  const cat = categoryOf(photo.category);
  const taken = photo.taken_at
    ? new Date(photo.taken_at).toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  return `
    <div style="width:200px;font-family:'Zen Kaku Gothic New',sans-serif;">
      ${photo.url ? `<img src="${photo.url}" alt="" style="width:100%;display:block;margin-bottom:6px;border:1px solid #C6BFA9;">` : ""}
      <div style="font-size:11px;color:#565A4E;">${photo.seq ? "No." + photo.seq + " ・ " : ""}${cat.label}${taken ? " ・ " + taken : ""}</div>
      ${photo.caption ? `<div style="font-size:12.5px;margin-top:4px;">${escapeHtml(photo.caption)}</div>` : ""}
      <div style="font-size:10px;color:#565A4E;margin-top:4px;">${photo.lat?.toFixed(5)}, ${photo.lng?.toFixed(5)}</div>
    </div>
  `;
}

export default function DamageMapView({
  photos,
  center,
  zoom,
  selectedId,
  onSelect,
  onPickLocation,
  pickMode = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  // ハンドラは再生成されるので ref 経由で最新版を参照し、地図の作り直しを避ける
  const selectRef = useRef(onSelect);
  const pickRef = useRef(onPickLocation);
  useEffect(() => {
    selectRef.current = onSelect;
    pickRef.current = onPickLocation;
  }, [onSelect, onPickLocation]);

  // 地図の初期化（一度だけ）
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
    });

    // 地理院タイル（無料・商用可）。航空写真は崩落地形の確認に使える。
    const gsiAttribution =
      '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noreferrer">国土地理院</a>';
    const pale = L.tileLayer(
      "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
      { attribution: gsiAttribution, maxZoom: 18 },
    );
    const standard = L.tileLayer(
      "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
      { attribution: gsiAttribution, maxZoom: 18 },
    );
    const photo = L.tileLayer(
      "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
      { attribution: gsiAttribution, maxZoom: 18 },
    );
    pale.addTo(map);
    L.control
      .layers(
        { "地理院地図（淡色）": pale, "地理院地図（標準）": standard, 航空写真: photo },
        undefined,
        { position: "topright" },
      )
      .addTo(map);
    map.on("click", (e: L.LeafletMouseEvent) => {
      pickRef.current?.(e.latlng.lat, e.latlng.lng);
    });
    mapRef.current = map;

    // パネルの開閉や画面回転で地図の器が変わったらタイルを貼り直す
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(containerRef.current);

    const markers = markersRef.current;
    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      markers.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 座標つき写真のマーカーを同期
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const placed = photos.filter((p) => p.lat !== null && p.lng !== null);
    const seen = new Set(placed.map((p) => p.id));

    for (const [id, marker] of markersRef.current) {
      if (!seen.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }

    for (const photo of placed) {
      const cat = categoryOf(photo.category);
      const icon = L.divIcon({
        html: `<div class="pin${photo.id === selectedId ? " selected" : ""}" style="background:${cat.color}"><span>${photo.seq ?? cat.letter}</span></div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

      const existing = markersRef.current.get(photo.id);
      if (existing) {
        existing.setLatLng([photo.lat!, photo.lng!]);
        existing.setIcon(icon);
        existing.setPopupContent(popupHtml(photo));
      } else {
        const marker = L.marker([photo.lat!, photo.lng!], { icon }).addTo(map);
        marker.bindPopup(popupHtml(photo), { maxWidth: 220 });
        marker.on("click", () => selectRef.current?.(photo.id));
        markersRef.current.set(photo.id, marker);
      }
    }
  }, [photos, selectedId]);

  // 一覧側で選択された写真へ寄る
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const marker = markersRef.current.get(selectedId);
    if (!marker) return;
    map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 16), { duration: 0.6 });
    marker.openPopup();
  }, [selectedId]);

  // 位置指定モードではカーソルを変える
  useEffect(() => {
    const container = mapRef.current?.getContainer();
    if (container) container.style.cursor = pickMode ? "crosshair" : "";
  }, [pickMode]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
