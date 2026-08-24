"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, girisYap } from "@/lib/user";

export default function Home() {
  const router = useRouter();
  const [isim, setIsim] = useState("");
  const [bilinenIsim, setBilinenIsim] = useState<string | null>(null);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    const kullanici = getStoredUser();
    if (kullanici) setBilinenIsim(kullanici.isim);
  }, []);

  async function basla() {
    const girilenIsim = bilinenIsim ?? isim;
    if (!girilenIsim.trim()) return;
    setGonderiliyor(true);
    setHata(null);
    try {
      await girisYap(girilenIsim);
      router.push("/anasayfa");
    } catch {
      setHata("Bir şeyler ters gitti, tekrar dener misin?");
      setGonderiliyor(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 px-8 py-10 text-center">
      <p className="text-sm tracking-wide text-chalk/55">YKS&apos;ye hazırlan</p>

      <div className="flex flex-col items-center gap-1">
        <p className="font-marker text-2xl text-chalk">Hoşgeldin,</p>
        {bilinenIsim ? (
          <p className="font-marker text-5xl leading-tight text-chalk-yellow">
            {bilinenIsim}
          </p>
        ) : (
          <input
            value={isim}
            onChange={(e) => setIsim(e.target.value)}
            placeholder="isim yaz"
            className="w-56 border-b-2 border-chalk/40 bg-transparent text-center font-marker text-3xl text-chalk-yellow placeholder:text-chalk-yellow/30 focus:border-chalk-yellow focus:outline-none"
            maxLength={20}
          />
        )}
        <svg width="180" height="20" viewBox="0 0 180 20" className="mt-1">
          <path
            d="M4 12 Q40 4 80 10 T176 8"
            fill="none"
            stroke="#e8d189"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>
      </div>

      <p className="max-w-xs text-base text-chalk/65">
        Bugün de bir adım daha yaklaş.
      </p>

      {hata && <p className="text-sm text-chalk-coral">{hata}</p>}

      <button
        type="button"
        onClick={basla}
        disabled={gonderiliyor || (!bilinenIsim && !isim.trim())}
        className="mt-10 flex min-h-11 items-center justify-center rounded-2xl border-2 border-chalk px-12 py-3.5 font-marker text-lg text-chalk transition-colors hover:bg-chalk/5 disabled:opacity-40"
      >
        {gonderiliyor ? "..." : "Başla →"}
      </button>
    </main>
  );
}
