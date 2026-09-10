import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import CopyButton from "@/components/CopyButton";
import {
  cancelInvite,
  createShareLink,
  inviteMember,
  removeMember,
  revokeShareLink,
} from "./actions";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  owner: "オーナー",
  editor: "編集",
  viewer: "閲覧のみ",
};

async function resolveEmails(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, string>();
  try {
    const admin = createAdminClient();
    const entries = await Promise.all(
      userIds.map(async (id) => {
        const { data } = await admin.auth.admin.getUserById(id);
        return [id, data?.user?.email ?? id] as const;
      }),
    );
    return new Map(entries);
  } catch {
    // サービスロールキー未設定時はIDのまま表示する
    return new Map(userIds.map((id) => [id, id]));
  }
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ mapId: string }>;
}) {
  const { mapId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/m/${mapId}/share`);

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
  if (membership?.role !== "owner") {
    redirect(`/m/${mapId}`);
  }

  const [{ data: members }, { data: invites }, { data: links }] =
    await Promise.all([
      supabase.from("map_members").select("*").eq("map_id", mapId),
      supabase
        .from("map_invites")
        .select("*")
        .eq("map_id", mapId)
        .is("accepted_at", null),
      supabase
        .from("share_links")
        .select("*")
        .eq("map_id", mapId)
        .eq("revoked", false)
        .order("created_at", { ascending: false }),
    ]);

  const emails = await resolveEmails((members ?? []).map((m) => m.user_id));

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${proto}://${host}` : "";

  return (
    <div className="page-wrap">
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: 20, margin: "0 0 4px" }}>共有・メンバー</h1>
          <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-soft)" }}>
            {map.title}
          </p>
        </div>
        <Link href={`/m/${mapId}`} className="btn secondary small">
          地図に戻る
        </Link>
      </header>

      <section className="panel">
        <h2>メンバーを招待する</h2>
        <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px", lineHeight: 1.8 }}>
          招待したアドレスでログインすると、自動的にこの案件のメンバーになります。招待していないアドレスからは開けません。
        </p>
        <form action={inviteMember}>
          <input type="hidden" name="mapId" value={mapId} />
          <div className="row">
            <div className="field-row">
              <label htmlFor="invite-email">メールアドレス</label>
              <input
                id="invite-email"
                name="email"
                type="email"
                required
                placeholder="staff@example.com"
              />
            </div>
            <div className="field-row" style={{ maxWidth: 160 }}>
              <label htmlFor="invite-role">権限</label>
              <select id="invite-role" name="role" defaultValue="editor">
                <option value="editor">編集</option>
                <option value="viewer">閲覧のみ</option>
              </select>
            </div>
            <button type="submit" className="btn">
              招待
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>現在のメンバー</h2>
        {(members ?? []).map((member) => (
          <div key={member.user_id} className="list-line">
            <span>
              {emails.get(member.user_id)}
              <span style={{ color: "var(--ink-soft)", marginLeft: 8, fontSize: 12 }}>
                {ROLE_LABEL[member.role]}
              </span>
            </span>
            {member.role !== "owner" && (
              <form action={removeMember}>
                <input type="hidden" name="mapId" value={mapId} />
                <input type="hidden" name="userId" value={member.user_id} />
                <button type="submit" className="btn secondary small">
                  外す
                </button>
              </form>
            )}
          </div>
        ))}

        {(invites ?? []).length > 0 && (
          <>
            <h2 style={{ marginTop: 18 }}>招待中（未ログイン）</h2>
            {(invites ?? []).map((invite) => (
              <div key={invite.id} className="list-line">
                <span>
                  {invite.email}
                  <span style={{ color: "var(--ink-soft)", marginLeft: 8, fontSize: 12 }}>
                    {ROLE_LABEL[invite.role]}
                  </span>
                </span>
                <form action={cancelInvite}>
                  <input type="hidden" name="mapId" value={mapId} />
                  <input type="hidden" name="inviteId" value={invite.id} />
                  <button type="submit" className="btn secondary small">
                    取り消す
                  </button>
                </form>
              </div>
            ))}
          </>
        )}
      </section>

      <section className="panel">
        <h2>閲覧専用の共有リンク</h2>
        <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px", lineHeight: 1.8 }}>
          リンクを知っている人が地図と写真を閲覧できます。書き込みやアップロードはできません。
        </p>
        <form action={createShareLink}>
          <input type="hidden" name="mapId" value={mapId} />
          <div className="row">
            <div className="field-row">
              <label htmlFor="link-label">用途メモ（任意）</label>
              <input
                id="link-label"
                name="label"
                type="text"
                placeholder="例：9月定例会 資料用"
              />
            </div>
            <div className="field-row" style={{ maxWidth: 160 }}>
              <label htmlFor="link-days">有効期限</label>
              <select id="link-days" name="days" defaultValue="30">
                <option value="7">7日</option>
                <option value="30">30日</option>
                <option value="90">90日</option>
                <option value="0">無期限</option>
              </select>
            </div>
            <button type="submit" className="btn">
              発行
            </button>
          </div>
        </form>

        <div style={{ marginTop: 16 }}>
          {(links ?? []).length === 0 ? (
            <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: 0 }}>
              発行済みのリンクはありません。
            </p>
          ) : (
            (links ?? []).map((link) => (
              <div key={link.token} className="list-line">
                <span style={{ minWidth: 0 }}>
                  <span className="mono">{`${origin}/view/${link.token}`}</span>
                  <br />
                  <span style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
                    {link.label || "メモなし"} ・{" "}
                    {link.expires_at
                      ? `${new Date(link.expires_at).toLocaleDateString("ja-JP")} まで`
                      : "無期限"}
                  </span>
                </span>
                <span style={{ display: "flex", gap: 8 }}>
                  <CopyButton value={`${origin}/view/${link.token}`} />
                  <form action={revokeShareLink}>
                    <input type="hidden" name="mapId" value={mapId} />
                    <input type="hidden" name="token" value={link.token} />
                    <button type="submit" className="btn secondary small">
                      失効
                    </button>
                  </form>
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
