"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredUser } from "@/lib/user";
import { supabase } from "@/lib/supabase";

export default function HedefEkle() {
  const router = useRouter();
  const [metin, setMetin] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    if (!getStoredUser()) router.replace("/");
  }, [router]);

  async function kaydet() {
    const kullanici = getStoredUser();
    const temiz = metin.trim();
    if (!kullanici || !temiz) return;

    setGonderiliyor(true);
    setHata(null);
    const { error } = await supabase
      .from("hedefler")
      .insert({ kullanici_id: kullanici.id, metin: temiz });

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
        <h1 className="font-marker text-2xl">Hedef Koy</h1>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm text-chalk/55">Bugünkü hedefin ne?</p>
        <input
          type="text"
          value={metin}
          onChange={(e) => setMetin(e.target.value)}
          placeholder="50 matematik sorusu çöz"
          className="w-full border-b-2 border-chalk/40 bg-transparent py-2 text-lg text-chalk placeholder:text-chalk/25 focus:border-chalk-yellow focus:outline-none"
        />
      </div>

      {hata && <p className="text-center text-sm text-chalk-coral">{hata}</p>}

      <div className="flex flex-1 items-end justify-center pb-1.5">
        <button
          type="button"
          onClick={kaydet}
          disabled={gonderiliyor || !metin.trim()}
          className="flex min-h-11 items-center justify-center rounded-xl border-2 border-chalk-yellow px-10 font-marker text-[15px] text-chalk-yellow disabled:opacity-40"
        >
          {gonderiliyor ? "..." : "Kaydet"}
        </button>
      </div>
    </div>
  );
}
