import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { withSignedUrls } from "@/lib/photos";
import ReportBuilder from "@/components/ReportBuilder";
import type { DamageMap, Photo } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ mapId: string }>;
}) {
  const { mapId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/m/${mapId}/report`);

  // 書類の写真番号は地図のピン番号と一致させるため、通し番号順に並べる
  const [{ data: map }, { data: photos }] = await Promise.all([
    supabase.from("maps").select("*").eq("id", mapId).maybeSingle(),
    supabase
      .from("photos")
      .select("*")
      .eq("map_id", mapId)
      .order("seq", { ascending: true, nullsFirst: false }),
  ]);
  if (!map) notFound();

  const withUrls = await withSignedUrls(supabase, (photos ?? []) as Photo[]);

  return <ReportBuilder map={map as DamageMap} photos={withUrls} />;
}
