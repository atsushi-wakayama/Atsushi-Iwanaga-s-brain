import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { withSignedUrls } from "@/lib/photos";
import MapWorkspace from "@/components/MapWorkspace";
import type { DamageMap, MapRole, Photo } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MapPage({
  params,
}: {
  params: Promise<{ mapId: string }>;
}) {
  const { mapId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/m/${mapId}`);

  // 案件と権限は1クエリで、写真とは並列で取る。
  // Supabase は東京、Vercel の関数も東京だが、往復のたびに遅延が積み上がるため。
  const [{ data: map }, { data: photos }] = await Promise.all([
    supabase
      .from("maps")
      .select("*, map_members!inner(role)")
      .eq("id", mapId)
      .eq("map_members.user_id", user.id)
      .maybeSingle(),
    supabase
      .from("photos")
      .select("*")
      .eq("map_id", mapId)
      .order("seq", { ascending: false, nullsFirst: false }),
  ]);
  if (!map) notFound();

  const role = ((map.map_members as { role: MapRole }[])[0]?.role ??
    "viewer") as MapRole;
  const canEdit = role === "owner" || role === "editor";

  const withUrls = await withSignedUrls(supabase, (photos ?? []) as Photo[]);

  return (
    <MapWorkspace
      map={map as DamageMap}
      initialPhotos={withUrls}
      canEdit={canEdit}
      headerRight={
        <>
          <Link href={`/m/${mapId}/report`} className="btn secondary small">
            相談書を作成
          </Link>
          {role === "owner" && (
            <Link href={`/m/${mapId}/share`} className="btn secondary small">
              共有・メンバー
            </Link>
          )}
          <Link href="/" className="btn secondary small">
            案件一覧
          </Link>
        </>
      }
    />
  );
}
