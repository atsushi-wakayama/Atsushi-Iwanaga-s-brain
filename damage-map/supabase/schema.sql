-- =========================================================
-- 被害箇所マッピング — Supabase スキーマ
-- Supabase ダッシュボード > SQL Editor に貼り付けて実行する
-- =========================================================

-- ---------- テーブル ----------

-- 案件（1案件 = 1マップ）
create table if not exists public.maps (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  center_lat  double precision not null default 33.83,
  center_lng  double precision not null default 135.27,
  zoom        integer not null default 11,
  owner_id    uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- 案件のメンバー
create table if not exists public.map_members (
  map_id     uuid not null references public.maps (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null default 'editor' check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (map_id, user_id)
);

-- 招待（メールアドレス宛。初回ログイン時にメンバーへ昇格する）
create table if not exists public.map_invites (
  id          uuid primary key default gen_random_uuid(),
  map_id      uuid not null references public.maps (id) on delete cascade,
  email       text not null,
  role        text not null default 'editor' check (role in ('editor', 'viewer')),
  invited_by  uuid references auth.users (id) on delete set null,
  accepted_at timestamptz,
  created_at  timestamptz not null default now(),
  unique (map_id, email)
);

-- 閲覧専用の共有リンク
create table if not exists public.share_links (
  token      text primary key,
  map_id     uuid not null references public.maps (id) on delete cascade,
  label      text,
  expires_at timestamptz,
  revoked    boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- 写真（画像実体は Storage、ここには参照パスとメタデータのみ）
create table if not exists public.photos (
  id         uuid primary key default gen_random_uuid(),
  map_id     uuid not null references public.maps (id) on delete cascade,
  image_path text not null,
  lat        double precision,
  lng        double precision,
  category   text not null default 'other' check (category in ('road', 'slide', 'tree', 'flood', 'other')),
  caption    text,
  taken_at   timestamptz,
  file_name  text,
  width      integer,
  height     integer,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists photos_map_id_idx        on public.photos (map_id, created_at desc);
create index if not exists map_members_user_id_idx  on public.map_members (user_id);
create index if not exists map_invites_email_idx    on public.map_invites (lower(email));
create index if not exists share_links_map_id_idx   on public.share_links (map_id);

-- ---------- ヘルパー関数 ----------
-- RLS ポリシーの中から map_members を直接参照すると再帰するため、
-- security definer 関数に逃がして判定する。

create or replace function public.is_map_member(target_map uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.map_members m
    where m.map_id = target_map and m.user_id = auth.uid()
  );
$$;

create or replace function public.can_edit_map(target_map uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.map_members m
    where m.map_id = target_map
      and m.user_id = auth.uid()
      and m.role in ('owner', 'editor')
  );
$$;

create or replace function public.is_map_owner(target_map uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.map_members m
    where m.map_id = target_map
      and m.user_id = auth.uid()
      and m.role = 'owner'
  );
$$;

-- 案件を作った本人を owner としてメンバーに入れる
create or replace function public.handle_new_map()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.map_members (map_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_map_created on public.maps;
create trigger on_map_created
  after insert on public.maps
  for each row execute function public.handle_new_map();

-- ログイン後に、自分のメールアドレス宛の招待をメンバーシップへ変換する
create or replace function public.claim_invites()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  my_email text;
  claimed  integer;
begin
  select lower(email) into my_email from auth.users where id = auth.uid();
  if my_email is null then
    return 0;
  end if;

  with pending as (
    select * from public.map_invites
    where lower(email) = my_email and accepted_at is null
  ), inserted as (
    insert into public.map_members (map_id, user_id, role)
    select p.map_id, auth.uid(), p.role from pending p
    on conflict (map_id, user_id) do nothing
    returning map_id
  )
  update public.map_invites i
     set accepted_at = now()
    from pending p
   where i.id = p.id;

  get diagnostics claimed = row_count;
  return claimed;
end;
$$;

-- ---------- RLS ----------

alter table public.maps         enable row level security;
alter table public.map_members  enable row level security;
alter table public.map_invites  enable row level security;
alter table public.share_links  enable row level security;
alter table public.photos       enable row level security;

-- maps
drop policy if exists maps_select on public.maps;
create policy maps_select on public.maps
  for select using (public.is_map_member(id));

drop policy if exists maps_insert on public.maps;
create policy maps_insert on public.maps
  for insert with check (owner_id = auth.uid());

drop policy if exists maps_update on public.maps;
create policy maps_update on public.maps
  for update using (public.can_edit_map(id)) with check (public.can_edit_map(id));

drop policy if exists maps_delete on public.maps;
create policy maps_delete on public.maps
  for delete using (public.is_map_owner(id));

-- map_members
drop policy if exists map_members_select on public.map_members;
create policy map_members_select on public.map_members
  for select using (user_id = auth.uid() or public.is_map_member(map_id));

drop policy if exists map_members_write on public.map_members;
create policy map_members_write on public.map_members
  for all using (public.is_map_owner(map_id)) with check (public.is_map_owner(map_id));

-- map_invites（招待の管理はオーナーのみ）
drop policy if exists map_invites_all on public.map_invites;
create policy map_invites_all on public.map_invites
  for all using (public.is_map_owner(map_id)) with check (public.is_map_owner(map_id));

-- share_links（発行・失効はオーナーのみ。閲覧側はサーバー経由で解決する）
drop policy if exists share_links_select on public.share_links;
create policy share_links_select on public.share_links
  for select using (public.is_map_member(map_id));

drop policy if exists share_links_write on public.share_links;
create policy share_links_write on public.share_links
  for all using (public.is_map_owner(map_id)) with check (public.is_map_owner(map_id));

-- photos
drop policy if exists photos_select on public.photos;
create policy photos_select on public.photos
  for select using (public.is_map_member(map_id));

drop policy if exists photos_insert on public.photos;
create policy photos_insert on public.photos
  for insert with check (public.can_edit_map(map_id) and created_by = auth.uid());

drop policy if exists photos_update on public.photos;
create policy photos_update on public.photos
  for update using (public.can_edit_map(map_id)) with check (public.can_edit_map(map_id));

drop policy if exists photos_delete on public.photos;
create policy photos_delete on public.photos
  for delete using (public.can_edit_map(map_id));

-- ---------- Storage ----------
-- 非公開バケット。オブジェクトパスの先頭セグメントを map_id にして権限を判定する。

insert into storage.buckets (id, name, public)
values ('damage-photos', 'damage-photos', false)
on conflict (id) do nothing;

drop policy if exists damage_photos_select on storage.objects;
create policy damage_photos_select on storage.objects
  for select using (
    bucket_id = 'damage-photos'
    and public.is_map_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists damage_photos_insert on storage.objects;
create policy damage_photos_insert on storage.objects
  for insert with check (
    bucket_id = 'damage-photos'
    and public.can_edit_map(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists damage_photos_delete on storage.objects;
create policy damage_photos_delete on storage.objects
  for delete using (
    bucket_id = 'damage-photos'
    and public.can_edit_map(((storage.foldername(name))[1])::uuid)
  );
