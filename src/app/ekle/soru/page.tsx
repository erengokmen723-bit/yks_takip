"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredUser } from "@/lib/user";
import { supabase } from "@/lib/supabase";
import { DERSLER } from "@/lib/dersler";

const ALANLAR = [
  { key: "dogru", etiket: "Doğru", renk: "focus:border-chalk-green" },
  { key: "yanlis", etiket: "Yanlış", renk: "focus:border-chalk-coral" },
  { key: "bos", etiket: "Boş", renk: "focus:border-chalk/50" },
] as const;

export default function SoruEkle() {
  const router = useRouter();
  const [ders, setDers] = useState<string | null>(null);
  const [degerler, setDegerler] = useState({ dogru: "", yanlis: "", bos: "" });
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    if (!getStoredUser()) router.replace("/");
  }, [router]);

  const dogru = parseInt(degerler.dogru, 10) || 0;
  const yanlis = parseInt(degerler.yanlis, 10) || 0;
  const bos = parseInt(degerler.bos, 10) || 0;
  const toplam = dogru + yanlis + bos;

  async function kaydet() {
    const kullanici = getStoredUser();
    if (!kullanici || !ders || toplam <= 0) return;

    setGonderiliyor(true);
    setHata(null);
    const { error } = await supabase
      .from("sorular")
      .insert({ kullanici_id: kullanici.id, ders, sayi: toplam, dogru, yanlis, bos });

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
        <h1 className="font-marker text-2xl">Soru Ekle</h1>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm text-chalk/55">Hangi ders?</p>
        <div className="grid grid-cols-2 gap-3">
          {DERSLER.map((d) => (
            <button
              key={d.ad}
              type="button"
              onClick={() => setDers(d.ad)}
              className={`min-h-11 rounded-xl border-2 py-3 text-base font-bold ${d.renk} ${
                ders === d.ad ? d.border : "border-chalk/20"
              }`}
            >
              {d.ad}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm text-chalk/55">Doğru / yanlış / boş?</p>
        <div className="grid grid-cols-3 gap-3">
          {ALANLAR.map((a) => (
            <div key={a.key} className="flex flex-col items-center gap-1.5">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={degerler[a.key]}
                onChange={(e) =>
                  setDegerler((onceki) => ({ ...onceki, [a.key]: e.target.value }))
                }
                placeholder="0"
                className={`w-full border-b-2 border-chalk/40 bg-transparent py-2 text-center font-marker text-3xl text-chalk placeholder:text-chalk/25 focus:outline-none ${a.renk}`}
              />
              <span className="text-xs text-chalk/50">{a.etiket}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-chalk/55">
          Toplam <span className="font-bold text-chalk">{toplam}</span> soru
        </p>
      </div>

      {hata && <p className="text-center text-sm text-chalk-coral">{hata}</p>}

      <div className="flex flex-1 items-end justify-center pb-1.5">
        <button
          type="button"
          onClick={kaydet}
          disabled={gonderiliyor || !ders || toplam <= 0}
          className="flex min-h-11 items-center justify-center rounded-xl border-2 border-chalk-yellow px-10 font-marker text-[15px] text-chalk-yellow disabled:opacity-40"
        >
          {gonderiliyor ? "..." : "Kaydet"}
        </button>
      </div>
    </div>
  );
}
