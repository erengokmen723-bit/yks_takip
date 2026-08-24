"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { getStoredUser, type Kullanici } from "@/lib/user";
import { supabase } from "@/lib/supabase";

const DERSLER = [
  { ad: "Matematik", renk: "text-chalk-yellow", href: "/ders/matematik" },
  { ad: "Fizik", renk: "text-chalk-blue" },
  { ad: "Kimya", renk: "text-chalk-coral" },
  { ad: "Türkçe", renk: "text-chalk-green" },
];

const denemeler = [
  { x: 20, y: 150 },
  { x: 90, y: 130 },
  { x: 160, y: 110 },
  { x: 230, y: 85 },
  { x: 300, y: 45 },
];

const hedefler = [
  { text: "50 matematik sorusu çöz", tamam: true },
  { text: "Fizik konu tekrarı — Optik", tamam: false },
  { text: "1 deneme çöz", tamam: false },
];

const bugununTarihi = new Date().toLocaleDateString("tr-TR", {
  day: "numeric",
  month: "long",
});

function TopBar({ active, isim }: { active: number; isim: string }) {
  return (
    <>
      <div className="flex items-center justify-between px-6 pt-6 text-[13px] text-chalk/55">
        <span>{bugununTarihi}</span>
        <span>Merhaba, {isim}</span>
      </div>
      <div className="flex justify-center gap-2 py-4">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`block h-2 w-2 rounded-full ${
              i === active ? "bg-chalk" : "bg-chalk/30"
            }`}
          />
        ))}
      </div>
    </>
  );
}

export default function Anasayfa() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [kullanici, setKullanici] = useState<Kullanici | null>(null);
  const [dersSayilari, setDersSayilari] = useState<Record<string, number>>({});

  useEffect(() => {
    const k = getStoredUser();
    if (!k) {
      router.replace("/");
      return;
    }
    setKullanici(k);

    const bugun = new Date().toLocaleDateString("en-CA");

    supabase
      .from("sorular")
      .select("ders, sayi")
      .eq("kullanici_id", k.id)
      .eq("tarih", bugun)
      .then(({ data }) => {
        const toplamlar: Record<string, number> = {};
        for (const satir of data ?? []) {
          toplamlar[satir.ders] = (toplamlar[satir.ders] ?? 0) + satir.sayi;
        }
        setDersSayilari(toplamlar);
      });
  }, [router]);

  const onScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  if (!kullanici) return null;

  const toplam = DERSLER.reduce((sum, d) => sum + (dersSayilari[d.ad] ?? 0), 0);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar active={active} isim={kullanici.isim} />

      <div
        ref={containerRef}
        onScroll={onScroll}
        className="no-scrollbar flex flex-1 snap-x snap-mandatory overflow-x-auto"
      >
        {/* Sayfa 1 — Bugün çözülen sorular */}
        <section className="flex w-full shrink-0 snap-center flex-col gap-4 px-6 pb-6">
          <h1 className="font-marker text-2xl">Bugün Çözülen Sorular</h1>

          <div className="flex flex-col">
            {DERSLER.map((d) => {
              const row = (
                <div className="flex items-baseline justify-between border-b border-dashed border-chalk/25 py-2.5">
                  <span className={`text-lg font-bold ${d.renk}`}>{d.ad}</span>
                  <span className="text-xl font-bold text-chalk">
                    {dersSayilari[d.ad] ?? 0}
                  </span>
                </div>
              );
              return d.href ? (
                <Link key={d.ad} href={d.href}>
                  {row}
                </Link>
              ) : (
                <div key={d.ad}>{row}</div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-1 flex-col items-center justify-center">
            <div className="relative flex flex-col items-center gap-1 px-10 py-4">
              <svg
                viewBox="0 0 150 76"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
              >
                <path
                  d="M10 38 Q4 6 75 8 Q146 6 140 40 Q144 70 75 68 Q6 70 10 38Z"
                  fill="none"
                  stroke="#e8d189"
                  strokeWidth="3"
                  opacity="0.85"
                />
              </svg>
              <span className="text-xs text-chalk/55">Toplam</span>
              <span className="font-marker text-[44px] leading-none">{toplam}</span>
            </div>
          </div>
        </section>

        {/* Sayfa 2 — Deneme net trendi */}
        <section className="flex w-full shrink-0 snap-center flex-col gap-4 px-6 pb-6">
          <div>
            <h1 className="font-marker text-2xl">Deneme Net Ortalaman</h1>
            <p className="mt-1 text-[13px] text-chalk/50">Son 5 deneme · TYT</p>
          </div>

          <svg width="100%" viewBox="0 0 320 220" className="mt-2">
            <line x1="10" y1="150" x2="310" y2="150" stroke="rgba(242,239,228,0.15)" strokeWidth="1" />
            <line x1="10" y1="45" x2="310" y2="45" stroke="rgba(242,239,228,0.15)" strokeWidth="1" />

            <path
              d="M20,150 C 45,140 65,135 90,130 S 135,115 160,110 S 200,95 230,85 S 270,60 300,45"
              fill="none"
              stroke="#f2efe4"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {denemeler.slice(0, -1).map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="5" fill="#f2efe4" opacity="0.6" />
            ))}
            <circle cx={denemeler[4].x} cy={denemeler[4].y} r="8" fill="#e8d189" />

            {denemeler.map((p, i) => (
              <text
                key={i}
                x={p.x}
                y="172"
                fill="rgba(242,239,228,0.45)"
                fontSize="11"
                textAnchor="middle"
              >
                {i + 1}
              </text>
            ))}

            <text x="20" y="135" fill="rgba(242,239,228,0.4)" fontSize="12" textAnchor="middle">
              34
            </text>
            <text x="300" y="30" fill="#e8d189" fontSize="16" fontWeight="700" textAnchor="middle">
              68
            </text>
          </svg>
          <p className="-mt-2 text-center text-xs text-chalk/50">1. Deneme → 5. Deneme</p>
        </section>

        {/* Sayfa 3 — Bugünkü hedefler */}
        <section className="flex w-full shrink-0 snap-center flex-col gap-4 px-6 pb-6">
          <h1 className="font-marker text-2xl">Bugünkü Hedefler</h1>

          <div className="flex flex-col gap-4">
            {hedefler.map((h) => (
              <div key={h.text} className="flex items-center gap-3.5">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={h.tamam ? "#e8d189" : "#f2efe4"} strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  {h.tamam && <path d="M7 12l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />}
                </svg>
                <span
                  className={
                    h.tamam
                      ? "text-[17px] text-chalk/50 line-through decoration-chalk/40"
                      : "text-[17px] text-chalk"
                  }
                >
                  {h.text}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-1 items-end justify-center pb-1.5">
            <p className="text-[13px] text-chalk/50">
              {hedefler.filter((h) => h.tamam).length} / {hedefler.length} tamamlandı
            </p>
          </div>
        </section>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
