"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { getStoredUser } from "@/lib/user";
import { supabase } from "@/lib/supabase";
import { DERSLER } from "@/lib/dersler";

type GunKaydi = { tarih: string; sayi: number; dogru: number; yanlis: number; bos: number };

function formatTarih(tarih: string) {
  return new Date(tarih).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

export default function DersDetay() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const ders = DERSLER.find((d) => d.slug === params.slug);
  const [kayitlar, setKayitlar] = useState<GunKaydi[] | null>(null);

  useEffect(() => {
    const k = getStoredUser();
    if (!k) {
      router.replace("/");
      return;
    }
    if (!ders) {
      router.replace("/anasayfa");
      return;
    }

    supabase
      .from("sorular")
      .select("tarih, sayi, dogru, yanlis, bos")
      .eq("kullanici_id", k.id)
      .eq("ders", ders.ad)
      .order("tarih", { ascending: false })
      .then(({ data }) => {
        const gruplar: Record<string, GunKaydi> = {};
        for (const satir of data ?? []) {
          const onceki = gruplar[satir.tarih] ?? {
            tarih: satir.tarih,
            sayi: 0,
            dogru: 0,
            yanlis: 0,
            bos: 0,
          };
          gruplar[satir.tarih] = {
            tarih: satir.tarih,
            sayi: onceki.sayi + satir.sayi,
            dogru: onceki.dogru + satir.dogru,
            yanlis: onceki.yanlis + satir.yanlis,
            bos: onceki.bos + satir.bos,
          };
        }
        setKayitlar(
          Object.values(gruplar).sort((a, b) => (a.tarih < b.tarih ? 1 : -1))
        );
      });
  }, [router, ders]);

  if (!ders) return null;

  const toplam = kayitlar?.reduce((sum, k) => sum + k.sayi, 0) ?? 0;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-4 px-6 pb-6 pt-6">
        <div className="flex items-center gap-3.5">
          <Link
            href="/anasayfa"
            aria-label="Anasayfaya dön"
            className="flex h-11 w-11 items-center justify-center"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f2efe4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </Link>
          <div>
            <h1 className={`font-marker text-2xl ${ders.renk}`}>{ders.ad}</h1>
            {kayitlar && kayitlar.length > 0 && (
              <p className="text-[13px] text-chalk/55">Toplam {toplam} soru</p>
            )}
          </div>
        </div>

        {kayitlar && kayitlar.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10">
            <p className="text-sm text-chalk/50">Henüz {ders.ad} sorusu eklemedin.</p>
            <Link
              href="/ekle/soru"
              className="flex min-h-11 items-center justify-center rounded-xl border-2 border-chalk-yellow px-6 font-marker text-sm text-chalk-yellow"
            >
              Soru Ekle
            </Link>
          </div>
        )}

        {kayitlar && kayitlar.length > 0 && (
          <div className="flex flex-col overflow-y-auto">
            {kayitlar.map((k) => (
              <div
                key={k.tarih}
                className="flex flex-col gap-1 border-b border-dashed border-chalk/25 py-2.5"
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-[15px] text-chalk">{formatTarih(k.tarih)}</span>
                  <span className="text-lg font-bold text-chalk">{k.sayi}</span>
                </div>
                <p className="text-xs text-chalk/50">
                  <span className="text-chalk-green">{k.dogru} D</span>
                  {" · "}
                  <span className="text-chalk-coral">{k.yanlis} Y</span>
                  {" · "}
                  <span>{k.bos} B</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
