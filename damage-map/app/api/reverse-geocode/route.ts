import { NextResponse, type NextRequest } from "next/server";
import { MUNI } from "@/lib/muni";
import { createClient } from "@/lib/supabase/server";

/**
 * 緯度経度から住所文字列を引く。
 * 国土地理院の逆ジオコーダを使い、返ってきた市区町村コードを名称に直す。
 * コード表がクライアントバンドルに乗らないよう、サーバー側で解決する。
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "invalid coordinates" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${lat}&lon=${lon}`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (!response.ok) throw new Error(String(response.status));

    const json = (await response.json()) as {
      results?: { muniCd?: string; lv01Nm?: string };
    };
    const muniCd = json.results?.muniCd;
    const detail = json.results?.lv01Nm ?? "";
    // 逆ジオコーダは "30390" と "30390" 相当の数値表記が混在しうる
    const muni = muniCd ? (MUNI[muniCd] ?? MUNI[muniCd.padStart(5, "0")] ?? "") : "";

    return NextResponse.json({ address: `${muni}${detail}`.trim() || null });
  } catch {
    return NextResponse.json({ address: null });
  }
}
