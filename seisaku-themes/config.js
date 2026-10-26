/* ============================================================
   コメント欄の接続設定
   ------------------------------------------------------------
   Supabase のプロジェクトを作ったら、ここに2つの値を貼る。
   どちらも「公開してよい」値（anonキーは行レベルセキュリティで保護される）。

     url     … Project Settings → Data API → Project URL
     anonKey … Project Settings → API Keys → anon public

   空のままだと、コメント欄は表示されない（サイトは普通に動く）。
   ============================================================ */
const SUPABASE = {
  url: "https://tyxiqmgxtqyazsizgtml.supabase.co",
  anonKey: "sb_publishable_i3yeR1ngOk-n5BoxQ__jJw_v5CX9xyv",
};
