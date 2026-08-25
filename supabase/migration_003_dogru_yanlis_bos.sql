-- Soru kaydina dogru/yanlis/bos kirilimi ekler.
-- Supabase SQL Editor'da calistir.
-- sayi kolonu toplam (dogru+yanlis+bos) olarak kalmaya devam eder,
-- anasayfadaki gunluk toplam sorgusu degismeden calisir.

alter table sorular add column if not exists dogru int not null default 0;
alter table sorular add column if not exists yanlis int not null default 0;
alter table sorular add column if not exists bos int not null default 0;
