-- Mevcut Supabase projesini isim+sifre girisine (Supabase Auth) tasir.
-- Once Dashboard'da: Authentication -> Providers -> Email -> "Confirm email" kapat.
-- Sonra bu dosyayi SQL Editor'da calistir.

-- Eski (sifresiz) test kullanicilarini ve onlara bagli tum veriyi temizle.
-- Bu satirlarin auth.users karsiligi yok, yeni sistemle calismazlar.
delete from kullanicilar;

-- id artik kendi kendine uretilmiyor, auth.users ile eslesiyor.
alter table kullanicilar alter column id drop default;
alter table kullanicilar add constraint kullanicilar_id_fkey foreign key (id) references auth.users(id) on delete cascade;

-- Eski acik politikalari kaldir.
drop policy if exists "herkes okuyabilir" on kullanicilar;
drop policy if exists "herkes ekleyebilir" on kullanicilar;

drop policy if exists "herkes okuyabilir" on sorular;
drop policy if exists "herkes ekleyebilir" on sorular;
drop policy if exists "herkes silebilir" on sorular;

drop policy if exists "herkes okuyabilir" on denemeler;
drop policy if exists "herkes ekleyebilir" on denemeler;
drop policy if exists "herkes silebilir" on denemeler;

drop policy if exists "herkes okuyabilir" on hedefler;
drop policy if exists "herkes ekleyebilir" on hedefler;
drop policy if exists "herkes guncelleyebilir" on hedefler;
drop policy if exists "herkes silebilir" on hedefler;

-- Yeni politikalar: herkes sadece kendi verisini okuyup yazabilir.
create policy "kendi profilini yonetir" on kullanicilar for all
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "kendi sorularini yonetir" on sorular for all
  using (auth.uid() = kullanici_id) with check (auth.uid() = kullanici_id);

create policy "kendi denemelerini yonetir" on denemeler for all
  using (auth.uid() = kullanici_id) with check (auth.uid() = kullanici_id);

create policy "kendi hedeflerini yonetir" on hedefler for all
  using (auth.uid() = kullanici_id) with check (auth.uid() = kullanici_id);
