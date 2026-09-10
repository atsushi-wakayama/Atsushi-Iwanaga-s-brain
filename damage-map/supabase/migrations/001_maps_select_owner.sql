-- 案件作成時の INSERT ... RETURNING が RLS で弾かれる問題の修正。
--
-- オーナーを map_members に登録するトリガーは AFTER ROW なので文の終了時に発火する。
-- 一方 RETURNING の行は挿入時点で SELECT ポリシーの評価を受けるため、
-- 「メンバーであること」だけを条件にしていると作成直後の自分の案件が見えない。
-- オーナーはメンバー表と無関係に自分の案件を見られるべきなので、その条件を足す。

drop policy if exists maps_select on public.maps;
create policy maps_select on public.maps
  for select using (owner_id = auth.uid() or public.is_map_member(id));
