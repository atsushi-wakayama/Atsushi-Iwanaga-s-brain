-- 政策テーマへのコメント
-- 承認したものだけ公開する方式（投稿は誰でも、表示は status='approved' のみ）

create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  theme_id   text not null,
  name       text,
  body       text not null,
  status     text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists comments_theme_idx
  on public.comments (theme_id, status, created_at desc);

alter table public.comments enable row level security;

-- 読む：承認済みだけ、誰でも読める
drop policy if exists "read approved comments" on public.comments;
create policy "read approved comments"
  on public.comments for select
  to anon, authenticated
  using (status = 'approved');

-- 書く：誰でも投稿できるが、必ず未承認（pending）で入る。長さも制限する
drop policy if exists "insert pending comments" on public.comments;
create policy "insert pending comments"
  on public.comments for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and char_length(body) between 5 and 1000
    and (name is null or char_length(name) <= 40)
    and char_length(theme_id) <= 80
  );

-- Data API から読み書きできるように権限を渡す（更新・削除は渡さない）
grant usage on schema public to anon, authenticated;
grant select, insert on public.comments to anon, authenticated;

-- 更新・削除のポリシーは作らない＝一般の利用者はできない
-- （承認はダッシュボードの Table Editor から status を approved に変える）
