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

  const { data: map } = await supabase
    .from("maps")
    .select("*")
    .eq("id", mapId)
    .maybeSingle();
  if (!map) notFound();

  const { data: membership } = await supabase
    .from("map_members")
    .select("role")
    .eq("map_id", mapId)
    .eq("user_id", user.id)
    .maybeSingle();

  const role = (membership?.role ?? "viewer") as MapRole;
  const canEdit = role === "owner" || role === "editor";

  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("map_id", mapId)
    .order("created_at", { ascending: false });

  const withUrls = await withSignedUrls(supabase, (photos ?? []) as Photo[]);

  return (
    <MapWorkspace
      map={map as DamageMap}
      initialPhotos={withUrls}
      canEdit={canEdit}
      headerRight={
        <>
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
