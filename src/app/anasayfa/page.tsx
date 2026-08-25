"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { getStoredUser, type Kullanici } from "@/lib/user";
import { supabase } from "@/lib/supabase";
import { DERSLER } from "@/lib/dersler";

type DersOzet = { sayi: number; dogru: number; yanlis: number; bos: number };
type Deneme = { id: string; net: number; tur: string };
type Hedef = { id: string; metin: string; tamam: boolean };
type DenemeTuru = "TYT" | "AYT";

const DENEME_TURLERI: DenemeTuru[] = ["TYT", "AYT"];

const CHART_X_START = 20;
const CHART_X_END = 300;
const CHART_Y_TOP = 30;
const CHART_Y_BOTTOM = 170;

function hesaplaNoktalar(denemeler: Deneme[]) {
  const n = denemeler.length;
  const degerler = denemeler.map((d) => d.net);
  const min = Math.min(...degerler);
  const max = Math.max(...degerler);
  const aralik = max - min || 1;

  return denemeler.map((d, i) => {
    const x =
      n === 1
        ? (CHART_X_START + CHART_X_END) / 2
        : CHART_X_START + (i * (CHART_X_END - CHART_X_START)) / (n - 1);
    const t = (d.net - min) / aralik;
    const y = CHART_Y_BOTTOM - t * (CHART_Y_BOTTOM - CHART_Y_TOP);
    return { x, y, net: d.net };
  });
}

const bugununTarihi = new Date().toLocaleDateString("tr-TR", {
  day: "numeric",
  month: "long",
});

function TopBar({
  active,
  isim,
  onReset,
}: {
  active: number;
  isim: string;
  onReset: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-6 pt-6 text-[13px] text-chalk/55">
        <span>{bugununTarihi}</span>
        <div className="flex items-center gap-2">
          <span>Merhaba, {isim}</span>
          <button
            type="button"
            onClick={onReset}
            aria-label="Verilerimi sıfırla"
            className="flex h-6 w-6 items-center justify-center text-chalk/40 hover:text-chalk-coral"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
            </svg>
          </button>
        </div>
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
  const [dersOzetleri, setDersOzetleri] = useState<Record<string, DersOzet>>({});
  const [denemelerByTur, setDenemelerByTur] = useState<Record<DenemeTuru, Deneme[]>>({
    TYT: [],
    AYT: [],
  });
  const [seciliTur, setSeciliTur] = useState<DenemeTuru>("TYT");
  const [hedefler, setHedefler] = useState<Hedef[]>([]);

  useEffect(() => {
    const k = getStoredUser();
    if (!k) {
      router.replace("/");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage read on mount, not a reactive sync
    setKullanici(k);

    const bugun = new Date().toLocaleDateString("en-CA");

    supabase
      .from("sorular")
      .select("ders, sayi, dogru, yanlis, bos")
      .eq("kullanici_id", k.id)
      .eq("tarih", bugun)
      .then(({ data }) => {
        const toplamlar: Record<string, DersOzet> = {};
        for (const satir of data ?? []) {
          const onceki = toplamlar[satir.ders] ?? { sayi: 0, dogru: 0, yanlis: 0, bos: 0 };
          toplamlar[satir.ders] = {
            sayi: onceki.sayi + satir.sayi,
            dogru: onceki.dogru + satir.dogru,
            yanlis: onceki.yanlis + satir.yanlis,
            bos: onceki.bos + satir.bos,
          };
        }
        setDersOzetleri(toplamlar);
      });

    for (const tur of DENEME_TURLERI) {
      supabase
        .from("denemeler")
        .select("id, net, tur, created_at")
        .eq("kullanici_id", k.id)
        .eq("tur", tur)
        .order("created_at", { ascending: false })
        .limit(5)
        .then(({ data }) => {
          setDenemelerByTur((onceki) => ({ ...onceki, [tur]: (data ?? []).reverse() }));
        });
    }

    supabase
      .from("hedefler")
      .select("id, metin, tamam")
      .eq("kullanici_id", k.id)
      .eq("tarih", bugun)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setHedefler(data ?? []);
      });
  }, [router]);

  async function hedefTamamToggle(hedef: Hedef) {
    setHedefler((onceki) =>
      onceki.map((h) => (h.id === hedef.id ? { ...h, tamam: !h.tamam } : h))
    );
    await supabase.from("hedefler").update({ tamam: !hedef.tamam }).eq("id", hedef.id);
  }

  async function verileriSifirla() {
    if (!kullanici) return;
    const onay = window.confirm(
      `Emin misin, ${kullanici.isim}? Tüm sorular, denemeler ve hedeflerin silinecek.`
    );
    if (!onay) return;

    const sonuclar = await Promise.all([
      supabase.from("sorular").delete().eq("kullanici_id", kullanici.id),
      supabase.from("denemeler").delete().eq("kullanici_id", kullanici.id),
      supabase.from("hedefler").delete().eq("kullanici_id", kullanici.id),
    ]);

    const hata = sonuclar.find((s) => s.error);
    if (hata) {
      window.alert("Sıfırlama başarısız oldu, tekrar dener misin?");
      return;
    }

    setDersOzetleri({});
    setDenemelerByTur({ TYT: [], AYT: [] });
    setHedefler([]);
  }

  const onScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  if (!kullanici) return null;

  const toplam = DERSLER.reduce((sum, d) => sum + (dersOzetleri[d.ad]?.sayi ?? 0), 0);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar active={active} isim={kullanici.isim} onReset={verileriSifirla} />

      <div
        ref={containerRef}
        onScroll={onScroll}
        className="no-scrollbar flex flex-1 snap-x snap-mandatory overflow-x-auto"
      >
        {/* Sayfa 1 — Bugün çözülen sorular */}
        <section className="flex w-full shrink-0 snap-center [scroll-snap-stop:always] flex-col gap-4 px-6 pb-6">
          <h1 className="font-marker text-2xl">Bugün Çözülen Sorular</h1>

          <div className="flex flex-col">
            {DERSLER.map((d) => {
              const ozet = dersOzetleri[d.ad];
              const row = (
                <div className="flex flex-col gap-1 border-b border-dashed border-chalk/25 py-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className={`text-lg font-bold ${d.renk}`}>{d.ad}</span>
                    <span className="text-xl font-bold text-chalk">{ozet?.sayi ?? 0}</span>
                  </div>
                  {ozet && ozet.sayi > 0 && (
                    <p className="text-xs text-chalk/50">
                      <span className="text-chalk-green">{ozet.dogru} D</span>
                      {" · "}
                      <span className="text-chalk-coral">{ozet.yanlis} Y</span>
                      {" · "}
                      <span>{ozet.bos} B</span>
                    </p>
                  )}
                </div>
              );
              return (
                <Link key={d.ad} href={`/ders/${d.slug}`}>
                  {row}
                </Link>
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
        <section className="flex w-full shrink-0 snap-center [scroll-snap-stop:always] flex-col gap-4 px-6 pb-6">
          <div className="flex items-center justify-between">
            <h1 className="font-marker text-2xl">Deneme Net Ortalaman</h1>
            <div className="flex gap-1.5">
              {DENEME_TURLERI.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSeciliTur(t)}
                  className={`min-h-8 rounded-lg border px-3 text-xs font-bold ${
                    seciliTur === t
                      ? "border-chalk-yellow text-chalk-yellow"
                      : "border-chalk/20 text-chalk/50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {(() => {
            const denemeler = denemelerByTur[seciliTur];

            if (denemeler.length === 0) {
              return (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10">
                  <p className="text-sm text-chalk/50">
                    Henüz {seciliTur} denemen yok, ekleyerek trendini görmeye başla.
                  </p>
                  <Link
                    href="/ekle/deneme"
                    className="flex min-h-11 items-center justify-center rounded-xl border-2 border-chalk-yellow px-6 font-marker text-sm text-chalk-yellow"
                  >
                    Deneme Ekle
                  </Link>
                </div>
              );
            }

            const noktalar = hesaplaNoktalar(denemeler);
            const minIndex = noktalar.reduce(
              (en, p, i) => (p.net < noktalar[en].net ? i : en),
              0
            );
            const maxIndex = noktalar.reduce(
              (en, p, i) => (p.net > noktalar[en].net ? i : en),
              0
            );
            const path = noktalar
              .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
              .join(" ");

            return (
              <>
                <svg width="100%" viewBox="0 0 320 220" className="mt-2">
                  <line x1="10" y1="150" x2="310" y2="150" stroke="rgba(242,239,228,0.15)" strokeWidth="1" />
                  <line x1="10" y1="45" x2="310" y2="45" stroke="rgba(242,239,228,0.15)" strokeWidth="1" />

                  {noktalar.length > 1 && (
                    <path d={path} fill="none" stroke="#f2efe4" strokeWidth="2.5" strokeLinecap="round" />
                  )}

                  {noktalar.map((p, i) =>
                    i === noktalar.length - 1 ? null : (
                      <circle key={i} cx={p.x} cy={p.y} r="5" fill="#f2efe4" opacity="0.6" />
                    )
                  )}
                  <circle
                    cx={noktalar[noktalar.length - 1].x}
                    cy={noktalar[noktalar.length - 1].y}
                    r="8"
                    fill="#e8d189"
                  />

                  {noktalar.map((p, i) => (
                    <text key={i} x={p.x} y="172" fill="rgba(242,239,228,0.45)" fontSize="11" textAnchor="middle">
                      {i + 1}
                    </text>
                  ))}

                  {minIndex !== maxIndex && (
                    <text
                      x={noktalar[minIndex].x}
                      y={noktalar[minIndex].y + 18}
                      fill="rgba(242,239,228,0.4)"
                      fontSize="12"
                      textAnchor="middle"
                    >
                      {noktalar[minIndex].net}
                    </text>
                  )}
                  <text
                    x={noktalar[maxIndex].x}
                    y={noktalar[maxIndex].y - 10}
                    fill="#e8d189"
                    fontSize="16"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {noktalar[maxIndex].net}
                  </text>
                </svg>
                <p className="-mt-2 text-center text-xs text-chalk/50">
                  Son {noktalar.length} {seciliTur} denemesi
                </p>
              </>
            );
          })()}
        </section>

        {/* Sayfa 3 — Bugünkü hedefler */}
        <section className="flex w-full shrink-0 snap-center [scroll-snap-stop:always] flex-col gap-4 px-6 pb-6">
          <h1 className="font-marker text-2xl">Bugünkü Hedefler</h1>

          {hedefler.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10">
              <p className="text-sm text-chalk/50">Bugün için henüz hedef koymadın.</p>
              <Link
                href="/ekle/hedef"
                className="flex min-h-11 items-center justify-center rounded-xl border-2 border-chalk-yellow px-6 font-marker text-sm text-chalk-yellow"
              >
                Hedef Koy
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                {hedefler.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => hedefTamamToggle(h)}
                    className="flex min-h-11 items-center gap-3.5 text-left"
                  >
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
                      {h.metin}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex flex-1 items-end justify-center pb-1.5">
                <p className="text-[13px] text-chalk/50">
                  {hedefler.filter((h) => h.tamam).length} / {hedefler.length} tamamlandı
                </p>
              </div>
            </>
          )}
        </section>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
