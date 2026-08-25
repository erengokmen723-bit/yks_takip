"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { getStoredUser, type Kullanici } from "@/lib/user";
import { supabase } from "@/lib/supabase";

type GunOzet = { tarihISO: string; etiket: string; sayi: number };
type DenemeOzet = { adet: number; ortalama: number };

const DENEME_TURLERI = ["TYT", "AYT"] as const;

function sonYediGun(): { tarihISO: string; etiket: string }[] {
  const gunler: { tarihISO: string; etiket: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const etiket = d.toLocaleDateString("tr-TR", { weekday: "short" }).replace(".", "");
    gunler.push({ tarihISO: d.toLocaleDateString("en-CA"), etiket });
  }
  return gunler;
}

export default function Istatistik() {
  const router = useRouter();
  const [kullanici, setKullanici] = useState<Kullanici | null>(null);
  const [gunlukSorular, setGunlukSorular] = useState<GunOzet[]>([]);
  const [dyb, setDyb] = useState({ dogru: 0, yanlis: 0, bos: 0 });
  const [denemeOzetleri, setDenemeOzetleri] = useState<Record<string, DenemeOzet>>({});
  const [hedefOzeti, setHedefOzeti] = useState({ tamamlanan: 0, toplam: 0 });

  useEffect(() => {
    const k = getStoredUser();
    if (!k) {
      router.replace("/");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage read on mount, not a reactive sync
    setKullanici(k);

    const gunler = sonYediGun();
    const baslangic = gunler[0].tarihISO;
    const bitis = gunler[gunler.length - 1].tarihISO;

    supabase
      .from("sorular")
      .select("tarih, sayi, dogru, yanlis, bos")
      .eq("kullanici_id", k.id)
      .gte("tarih", baslangic)
      .lte("tarih", bitis)
      .then(({ data }) => {
        const gunlukToplam: Record<string, number> = {};
        let toplamDogru = 0;
        let toplamYanlis = 0;
        let toplamBos = 0;
        for (const satir of data ?? []) {
          gunlukToplam[satir.tarih] = (gunlukToplam[satir.tarih] ?? 0) + satir.sayi;
          toplamDogru += satir.dogru;
          toplamYanlis += satir.yanlis;
          toplamBos += satir.bos;
        }
        setGunlukSorular(
          gunler.map((g) => ({ ...g, sayi: gunlukToplam[g.tarihISO] ?? 0 }))
        );
        setDyb({ dogru: toplamDogru, yanlis: toplamYanlis, bos: toplamBos });
      });

    supabase
      .from("denemeler")
      .select("net, tur, tarih")
      .eq("kullanici_id", k.id)
      .gte("tarih", baslangic)
      .lte("tarih", bitis)
      .then(({ data }) => {
        const gruplar: Record<string, number[]> = {};
        for (const satir of data ?? []) {
          (gruplar[satir.tur] ??= []).push(satir.net);
        }
        const ozet: Record<string, DenemeOzet> = {};
        for (const [tur, netler] of Object.entries(gruplar)) {
          ozet[tur] = {
            adet: netler.length,
            ortalama: netler.reduce((a, b) => a + b, 0) / netler.length,
          };
        }
        setDenemeOzetleri(ozet);
      });

    supabase
      .from("hedefler")
      .select("tamam, tarih")
      .eq("kullanici_id", k.id)
      .gte("tarih", baslangic)
      .lte("tarih", bitis)
      .then(({ data }) => {
        const toplam = data?.length ?? 0;
        const tamamlanan = data?.filter((h) => h.tamam).length ?? 0;
        setHedefOzeti({ tamamlanan, toplam });
      });
  }, [router]);

  if (!kullanici) return null;

  const maxGunlukSayi = Math.max(1, ...gunlukSorular.map((g) => g.sayi));
  const bugunISO = new Date().toLocaleDateString("en-CA");
  const dybToplam = dyb.dogru + dyb.yanlis + dyb.bos;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-6 pb-6 pt-6">
        <div>
          <h1 className="font-marker text-2xl">Bu Hafta</h1>
          <p className="text-[13px] text-chalk/55">Son 7 gün</p>
        </div>

        {/* Günlük soru sayısı */}
        <div className="flex flex-col gap-3">
          <p className="text-sm text-chalk/55">Günlük çözülen soru</p>
          <div className="flex items-end justify-between gap-2 px-1" style={{ height: 96 }}>
            {gunlukSorular.map((g) => (
              <div key={g.tarihISO} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-xs text-chalk/60">{g.sayi > 0 ? g.sayi : ""}</span>
                <div
                  className={`w-full rounded-t-sm ${
                    g.tarihISO === bugunISO ? "bg-chalk-yellow" : "bg-chalk/30"
                  }`}
                  style={{ height: `${(g.sayi / maxGunlukSayi) * 64}px`, minHeight: g.sayi > 0 ? 4 : 0 }}
                />
                <span className="text-[11px] text-chalk/45">{g.etiket}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Doğru/Yanlış/Boş oranı */}
        <div className="flex flex-col gap-3">
          <p className="text-sm text-chalk/55">Haftalık doğru / yanlış / boş</p>
          {dybToplam === 0 ? (
            <p className="text-sm text-chalk/40">Bu hafta henüz soru eklenmedi.</p>
          ) : (
            <>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-chalk/10">
                <div className="bg-chalk-green" style={{ width: `${(dyb.dogru / dybToplam) * 100}%` }} />
                <div className="bg-chalk-coral" style={{ width: `${(dyb.yanlis / dybToplam) * 100}%` }} />
                <div className="bg-chalk/35" style={{ width: `${(dyb.bos / dybToplam) * 100}%` }} />
              </div>
              <p className="text-xs text-chalk/55">
                <span className="text-chalk-green">{dyb.dogru} doğru</span>
                {" · "}
                <span className="text-chalk-coral">{dyb.yanlis} yanlış</span>
                {" · "}
                <span>{dyb.bos} boş</span>
              </p>
            </>
          )}
        </div>

        {/* Deneme netleri */}
        <div className="flex flex-col gap-3">
          <p className="text-sm text-chalk/55">Deneme netleri</p>
          <div className="flex flex-col">
            {DENEME_TURLERI.map((tur) => {
              const ozet = denemeOzetleri[tur];
              return (
                <div
                  key={tur}
                  className="flex items-baseline justify-between border-b border-dashed border-chalk/25 py-2.5"
                >
                  <span className="text-base font-bold text-chalk">{tur}</span>
                  <span className="text-sm text-chalk/60">
                    {ozet
                      ? `${ozet.adet} deneme · ort. ${ozet.ortalama.toFixed(1)} net`
                      : "bu hafta yok"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hedefler */}
        <div className="flex flex-col gap-3">
          <p className="text-sm text-chalk/55">Hedef tamamlama</p>
          {hedefOzeti.toplam === 0 ? (
            <p className="text-sm text-chalk/40">Bu hafta hedef koyulmadı.</p>
          ) : (
            <p className="text-lg font-bold text-chalk">
              {hedefOzeti.tamamlanan} / {hedefOzeti.toplam}{" "}
              <span className="text-sm font-normal text-chalk/50">tamamlandı</span>
            </p>
          )}
        </div>
      </div>

      <BottomNav active="istatistik" />
    </div>
  );
}
