import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createMap } from "./actions";
import type { DamageMap } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // ログイン後に届いた招待を取り込む
  await supabase.rpc("claim_invites");

  const { data: maps } = await supabase
    .from("maps")
    .select("*")
    .order("created_at", { ascending: false });

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
          <h1 style={{ fontSize: 22, margin: "0 0 4px" }}>被害箇所マッピング</h1>
          <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-soft)" }}>
            {user.email}
          </p>
        </div>
        <form action="/auth/signout" method="post">
          <button type="submit" className="btn secondary small">
            ログアウト
          </button>
        </form>
      </header>

      <section className="panel">
        <h2>新しい案件をつくる</h2>
        <form action={createMap}>
          <div className="row">
            <div className="field-row">
              <label htmlFor="title">案件名</label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="例：令和8年9月豪雨 日高川町"
              />
            </div>
            <button type="submit" className="btn">
              作成
            </button>
          </div>
          <div className="field-row" style={{ marginTop: 12, marginBottom: 0 }}>
            <label htmlFor="description">説明（任意）</label>
            <input
              id="description"
              name="description"
              type="text"
              placeholder="視察日・対象地域など"
            />
          </div>
        </form>
      </section>

      <h2 style={{ fontSize: 15, margin: "24px 0 10px" }}>案件一覧</h2>
      {!maps?.length ? (
        <p className="empty-note">
          まだ案件がありません。上のフォームから最初の案件をつくってください。
        </p>
      ) : (
        (maps as DamageMap[]).map((map) => (
          <Link key={map.id} href={`/m/${map.id}`} className="map-card">
            <h3>{map.title}</h3>
            <p>
              {map.description || "説明なし"} ・ 作成{" "}
              {new Date(map.created_at).toLocaleDateString("ja-JP")}
            </p>
          </Link>
        ))
      )}
    </div>
  );
}
