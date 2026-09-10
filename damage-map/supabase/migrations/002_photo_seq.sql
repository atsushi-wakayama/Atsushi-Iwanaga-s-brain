-- 写真に案件ごとの通し番号を持たせる。
-- 相談書・陳情書の写真番号と、地図上のピン番号を一致させるために使う。
-- 並び替えや絞り込みで番号が動かないよう、登録時に確定させて以後変えない。

alter table public.photos add column if not exists seq integer;

-- 既存データへの採番（登録順）
with numbered as (
  select id, row_number() over (partition by map_id order by created_at, id) as n
  from public.photos
  where seq is null
)
update public.photos p
   set seq = numbered.n
  from numbered
 where p.id = numbered.id;

create or replace function public.assign_photo_seq()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.seq is null then
    select coalesce(max(seq), 0) + 1 into new.seq
      from public.photos where map_id = new.map_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_photo_seq on public.photos;
create trigger on_photo_seq
  before insert on public.photos
  for each row execute function public.assign_photo_seq();

create unique index if not exists photos_map_seq_idx on public.photos (map_id, seq);
