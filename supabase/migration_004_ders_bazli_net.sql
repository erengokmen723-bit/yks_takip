-- Deneme netlerini ders bazli kaydetmek icin kolonlar ekler.
-- Supabase SQL Editor'da calistir.
-- net kolonu toplam (tum derslerin net toplami) olarak kalmaya devam eder,
-- anasayfa/istatistik grafikleri degismeden calisir.
-- TYT: turkce/sosyal/matematik/fen. AYT (Sayisal): matematik/fizik/kimya/biyoloji.

alter table denemeler add column if not exists turkce_net numeric;
alter table denemeler add column if not exists sosyal_net numeric;
alter table denemeler add column if not exists matematik_net numeric;
alter table denemeler add column if not exists fen_net numeric;
alter table denemeler add column if not exists fizik_net numeric;
alter table denemeler add column if not exists kimya_net numeric;
alter table denemeler add column if not exists biyoloji_net numeric;
