-- 一覧表示用のサムネイルを別ファイルとして持たせる。
--
-- 一覧の88px枠に1200pxの原寸画像を読ませていたため、写真が増えるほど
-- 表示が重くなっていた。署名URLは発行のたびに変わりキャッシュも効かない。
-- 400px程度の軽い画像を別に保存し、一覧と地図のポップアップはそちらを使う。
-- 相談書や原寸表示は従来どおり image_path を使う。

alter table public.photos add column if not exists thumb_path text;
