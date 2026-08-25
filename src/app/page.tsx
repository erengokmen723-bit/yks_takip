"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, girisYap, kayitOl } from "@/lib/user";

function hataMesaji(hata: unknown, mod: "giris" | "kayit"): string {
  const mesaj = hata instanceof Error ? hata.message.toLowerCase() : "";

  if (mod === "kayit" && mesaj.includes("already registered")) {
    return "Bu isim zaten kayıtlı, giriş yapmayı dener misin?";
  }
  if (mod === "giris" && mesaj.includes("invalid login credentials")) {
    return "İsim veya şifre yanlış.";
  }
  if (mesaj.includes("password") && mesaj.includes("6")) {
    return "Şifre en az 6 karakter olmalı.";
  }
  return "Bir şeyler ters gitti, tekrar dener misin?";
}

export default function Home() {
  const router = useRouter();
  const [bilinenIsim, setBilinenIsim] = useState<string | null>(null);
  const [mod, setMod] = useState<"giris" | "kayit">("giris");
  const [isim, setIsim] = useState("");
  const [sifre, setSifre] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    const kullanici = getStoredUser();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage read on mount, not a reactive sync
    if (kullanici) setBilinenIsim(kullanici.isim);
  }, []);

  async function devamEt() {
    router.push("/anasayfa");
  }

  async function gonder() {
    if (!isim.trim() || !sifre) return;
    setGonderiliyor(true);
    setHata(null);
    try {
      if (mod === "kayit") {
        await kayitOl(isim, sifre);
      } else {
        await girisYap(isim, sifre);
      }
      router.push("/anasayfa");
    } catch (e) {
      setHata(hataMesaji(e, mod));
      setGonderiliyor(false);
    }
  }

  if (bilinenIsim) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-5 px-8 py-10 text-center">
        <p className="text-sm tracking-wide text-chalk/55">YKS&apos;ye hazırlan</p>

        <div className="flex flex-col items-center gap-1">
          <p className="font-marker text-2xl text-chalk">Hoşgeldin,</p>
          <p className="font-marker text-5xl leading-tight text-chalk-yellow">{bilinenIsim}</p>
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

        <p className="max-w-xs text-base text-chalk/65">Bugün de bir adım daha yaklaş.</p>

        <button
          type="button"
          onClick={devamEt}
          className="mt-10 flex min-h-11 items-center justify-center rounded-2xl border-2 border-chalk px-12 py-3.5 font-marker text-lg text-chalk transition-colors hover:bg-chalk/5"
        >
          Başla →
        </button>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 px-8 py-10 text-center">
      <p className="text-sm tracking-wide text-chalk/55">YKS&apos;ye hazırlan</p>
      <p className="font-marker text-3xl text-chalk-yellow">Hoşgeldin</p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setMod("giris");
            setHata(null);
          }}
          className={`min-h-11 rounded-xl border-2 px-5 font-marker text-sm ${
            mod === "giris" ? "border-chalk-yellow text-chalk-yellow" : "border-chalk/20 text-chalk/50"
          }`}
        >
          Giriş Yap
        </button>
        <button
          type="button"
          onClick={() => {
            setMod("kayit");
            setHata(null);
          }}
          className={`min-h-11 rounded-xl border-2 px-5 font-marker text-sm ${
            mod === "kayit" ? "border-chalk-yellow text-chalk-yellow" : "border-chalk/20 text-chalk/50"
          }`}
        >
          Kayıt Ol
        </button>
      </div>

      <div className="mt-4 flex w-64 flex-col gap-4">
        <input
          value={isim}
          onChange={(e) => setIsim(e.target.value)}
          placeholder="isim"
          maxLength={20}
          className="w-full border-b-2 border-chalk/40 bg-transparent py-1 text-center font-marker text-2xl text-chalk-yellow placeholder:text-chalk-yellow/30 focus:border-chalk-yellow focus:outline-none"
        />
        <input
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
          type="password"
          placeholder="şifre"
          className="w-full border-b-2 border-chalk/40 bg-transparent py-1 text-center text-lg text-chalk placeholder:text-chalk/30 focus:border-chalk-yellow focus:outline-none"
        />
      </div>

      {hata && <p className="max-w-xs text-sm text-chalk-coral">{hata}</p>}

      <button
        type="button"
        onClick={gonder}
        disabled={gonderiliyor || !isim.trim() || !sifre}
        className="mt-6 flex min-h-11 items-center justify-center rounded-2xl border-2 border-chalk px-12 py-3.5 font-marker text-lg text-chalk transition-colors hover:bg-chalk/5 disabled:opacity-40"
      >
        {gonderiliyor ? "..." : mod === "kayit" ? "Kayıt Ol →" : "Giriş Yap →"}
      </button>
    </main>
  );
}
