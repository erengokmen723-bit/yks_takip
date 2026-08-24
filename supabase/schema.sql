-- YKS Takip Sistemi - baslangic semasi
-- Supabase SQL Editor'da calistir.

create table if not exists kullanicilar (
  id uuid primary key default gen_random_uuid(),
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

-- Kucuk, guvenilir bir grup kullanacagi icin (sifresiz, isim tabanli kimlik)
-- RLS acik ama herkese acik policy'ler var - hassas veri yok.
alter table kullanicilar enable row level security;
alter table sorular enable row level security;
alter table denemeler enable row level security;
alter table hedefler enable row level security;

create policy "herkes okuyabilir" on kullanicilar for select using (true);
create policy "herkes ekleyebilir" on kullanicilar for insert with check (true);

create policy "herkes okuyabilir" on sorular for select using (true);
create policy "herkes ekleyebilir" on sorular for insert with check (true);

create policy "herkes okuyabilir" on denemeler for select using (true);
create policy "herkes ekleyebilir" on denemeler for insert with check (true);

create policy "herkes okuyabilir" on hedefler for select using (true);
create policy "herkes ekleyebilir" on hedefler for insert with check (true);
create policy "herkes guncelleyebilir" on hedefler for update using (true);
