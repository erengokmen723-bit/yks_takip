"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredUser } from "@/lib/user";
import { supabase } from "@/lib/supabase";

const DERSLER = [
  { ad: "Matematik", renk: "text-chalk-yellow", border: "border-chalk-yellow" },
  { ad: "Fizik", renk: "text-chalk-blue", border: "border-chalk-blue" },
  { ad: "Kimya", renk: "text-chalk-coral", border: "border-chalk-coral" },
  { ad: "Türkçe", renk: "text-chalk-green", border: "border-chalk-green" },
];

export default function SoruEkle() {
  const router = useRouter();
  const [ders, setDers] = useState<string | null>(null);
  const [sayi, setSayi] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    if (!getStoredUser()) router.replace("/");
  }, [router]);

  async function kaydet() {
    const kullanici = getStoredUser();
    const adet = parseInt(sayi, 10);
    if (!kullanici || !ders || !adet || adet <= 0) return;

    setGonderiliyor(true);
    setHata(null);
    const { error } = await supabase
      .from("sorular")
      .insert({ kullanici_id: kullanici.id, ders, sayi: adet });

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
        <p className="text-sm text-chalk/55">Kaç soru çözdün?</p>
        <input
          type="number"
          inputMode="numeric"
          value={sayi}
          onChange={(e) => setSayi(e.target.value)}
          placeholder="0"
          className="w-full border-b-2 border-chalk/40 bg-transparent py-2 text-center font-marker text-4xl text-chalk placeholder:text-chalk/25 focus:border-chalk-yellow focus:outline-none"
        />
      </div>

      {hata && <p className="text-center text-sm text-chalk-coral">{hata}</p>}

      <div className="flex flex-1 items-end justify-center pb-1.5">
        <button
          type="button"
          onClick={kaydet}
          disabled={gonderiliyor || !ders || !sayi}
          className="flex min-h-11 items-center justify-center rounded-xl border-2 border-chalk-yellow px-10 font-marker text-[15px] text-chalk-yellow disabled:opacity-40"
        >
          {gonderiliyor ? "..." : "Kaydet"}
        </button>
      </div>
    </div>
  );
}
