"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredUser } from "@/lib/user";
import { supabase } from "@/lib/supabase";

const TURLER = ["TYT", "AYT"] as const;
type Tur = (typeof TURLER)[number];

const DENEME_DERSLERI: Record<Tur, { key: string; ad: string }[]> = {
  TYT: [
    { key: "turkce_net", ad: "Türkçe" },
    { key: "sosyal_net", ad: "Sosyal Bilimler" },
    { key: "matematik_net", ad: "Matematik" },
    { key: "fen_net", ad: "Fen Bilimleri" },
  ],
  AYT: [
    { key: "matematik_net", ad: "Matematik" },
    { key: "fizik_net", ad: "Fizik" },
    { key: "kimya_net", ad: "Kimya" },
    { key: "biyoloji_net", ad: "Biyoloji" },
  ],
};

export default function DenemeEkle() {
  const router = useRouter();
  const [tur, setTur] = useState<Tur>("TYT");
  const [degerler, setDegerler] = useState<Record<string, string>>({});
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    if (!getStoredUser()) router.replace("/");
  }, [router]);

  const dersler = DENEME_DERSLERI[tur];
  const netler = dersler.map(
    (d) => parseFloat((degerler[d.key] ?? "").replace(",", ".")) || 0
  );
  const toplam = netler.reduce((a, b) => a + b, 0);

  function turSec(t: Tur) {
    setTur(t);
    setDegerler({});
  }

  async function kaydet() {
    const kullanici = getStoredUser();
    if (!kullanici || toplam <= 0) return;

    setGonderiliyor(true);
    setHata(null);

    const kayit: Record<string, unknown> = { kullanici_id: kullanici.id, tur, net: toplam };
    dersler.forEach((d, i) => {
      kayit[d.key] = netler[i];
    });

    const { error } = await supabase.from("denemeler").insert(kayit);

    if (error) {
      setHata("Kaydedilemedi, tekrar dener misin?");
      setGonderiliyor(false);
      return;
    }
    router.push("/anasayfa");
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-6 pt-6">
      <div className="flex items-center gap-3.5">
        <Link href="/anasayfa" aria-label="Anasayfaya dön" className="flex h-11 w-11 items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f2efe4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>
        <h1 className="font-marker text-2xl">Deneme Ekle</h1>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm text-chalk/55">Hangi tür?</p>
        <div className="grid grid-cols-2 gap-3">
          {TURLER.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => turSec(t)}
              className={`min-h-11 rounded-xl border-2 py-3 text-base font-bold text-chalk-yellow ${
                tur === t ? "border-chalk-yellow" : "border-chalk/20"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm text-chalk/55">Ders bazlı net</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          {dersler.map((d) => (
            <div key={d.key} className="flex flex-col items-center gap-1.5">
              <input
                type="text"
                inputMode="decimal"
                value={degerler[d.key] ?? ""}
                onChange={(e) =>
                  setDegerler((onceki) => ({ ...onceki, [d.key]: e.target.value }))
                }
                placeholder="0"
                className="w-full border-b-2 border-chalk/40 bg-transparent py-2 text-center font-marker text-2xl text-chalk placeholder:text-chalk/25 focus:border-chalk-yellow focus:outline-none"
              />
              <span className="text-xs text-chalk/50">{d.ad}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-chalk/55">
          Toplam net <span className="font-bold text-chalk">{Number(toplam.toFixed(2))}</span>
        </p>
      </div>

      {hata && <p className="text-center text-sm text-chalk-coral">{hata}</p>}

      <div className="flex flex-1 items-end justify-center pb-1.5">
        <button
          type="button"
          onClick={kaydet}
          disabled={gonderiliyor || toplam <= 0}
          className="flex min-h-11 items-center justify-center rounded-xl border-2 border-chalk-yellow px-10 font-marker text-[15px] text-chalk-yellow disabled:opacity-40"
        >
          {gonderiliyor ? "..." : "Kaydet"}
        </button>
      </div>
    </div>
  );
}
