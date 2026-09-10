import { createClient } from "@supabase/supabase-js";

/**
 * サービスロールキーを使うクライアント。RLS を迂回するのでサーバー側専用。
 * 共有リンク（未ログインの閲覧者）の解決にのみ使う。
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY が設定されていません");
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
