-- 念のための追加対策
-- RLSで既に防いでいるが、更新・削除の権限そのものを取り上げておく
revoke update, delete, truncate on public.comments from anon, authenticated;
