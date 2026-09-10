import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { withSignedUrls } from "@/lib/photos";
import MapWorkspace from "@/components/MapWorkspace";
import type { DamageMap, Photo } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function SharedViewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // 未ログインの閲覧者を相手にするため、トークンをサーバー側で検証する
  const admin = createAdminClient();
  const { data: link } = await admin
    .from("share_links")
    .select("*")
    .eq("token", token)
    .eq("revoked", false)
    .maybeSingle();

  if (!link) notFound();
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return (
      <div className="page-wrap" style={{ maxWidth: 460 }}>
        <h1 style={{ fontSize: 20, margin: "0 0 8px" }}>リンクの有効期限が切れています</h1>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.9 }}>
          この共有リンクは期限切れです。発行者に新しいリンクの発行を依頼してください。
        </p>
      </div>
    );
  }

  const [{ data: map }, { data: photos }] = await Promise.all([
    admin.from("maps").select("*").eq("id", link.map_id).maybeSingle(),
    admin
      .from("photos")
      .select("*")
      .eq("map_id", link.map_id)
      .order("created_at", { ascending: false }),
  ]);

  if (!map) notFound();

  const withUrls = await withSignedUrls(admin, (photos ?? []) as Photo[]);

  return (
    <MapWorkspace
      map={map as DamageMap}
      initialPhotos={withUrls}
      canEdit={false}
      headerRight={<span className="status-line">閲覧専用</span>}
    />
  );
}
