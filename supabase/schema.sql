-- YKS Takip Sistemi - baslangic semasi
-- Supabase SQL Editor'da calistir.
-- Kimlik dogrulama Supabase Auth ile yapilir (isim -> sahte e-posta + sifre).
-- Dashboard'da Authentication -> Providers -> Email -> "Confirm email" kapali olmali.

create table if not exists kullanicilar (
  id uuid primary key references auth.users(id) on delete cascade,
  isim text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists sorular (
  id uuid primary key default gen_random_uuid(),
  kullanici_id uuid not null references kullanicilar(id) on delete cascade,
  ders text not null,
  sayi int not null,
  tarih date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists denemeler (
  id uuid primary key default gen_random_uuid(),
  kullanici_id uuid not null references kullanicilar(id) on delete cascade,
  net numeric not null,
  tur text not null default 'TYT',
  tarih date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists hedefler (
  id uuid primary key default gen_random_uuid(),
  kullanici_id uuid not null references kullanicilar(id) on delete cascade,
  metin text not null,
  tamam boolean not null default false,
  tarih date not null default current_date,
  created_at timestamptz not null default now()
);

-- Her kullanici sadece kendi verisini okuyup yazabilir (auth.uid() Supabase Auth oturumundan gelir).
alter table kullanicilar enable row level security;
alter table sorular enable row level security;
alter table denemeler enable row level security;
alter table hedefler enable row level security;

create policy "kendi profilini yonetir" on kullanicilar for all
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "kendi sorularini yonetir" on sorular for all
  using (auth.uid() = kullanici_id) with check (auth.uid() = kullanici_id);

create policy "kendi denemelerini yonetir" on denemeler for all
  using (auth.uid() = kullanici_id) with check (auth.uid() = kullanici_id);

create policy "kendi hedeflerini yonetir" on hedefler for all
  using (auth.uid() = kullanici_id) with check (auth.uid() = kullanici_id);
