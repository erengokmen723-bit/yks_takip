import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";

const konular = [
  { ad: "Üslü Sayılar", sayi: 12 },
  { ad: "Köklü Sayılar", sayi: 0 },
  { ad: "Çarpanlara Ayırma", sayi: 5 },
  { ad: "Mutlak Değer", sayi: 0 },
  { ad: "Denklem Çözme", sayi: 25 },
];

export default function Matematik() {
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
          <h1 className="font-marker text-2xl text-chalk-yellow">Matematik</h1>
        </div>

        <div className="flex flex-col">
          {konular.map((k) => (
            <div
              key={k.ad}
              className="flex items-center justify-between border-b border-dashed border-chalk/25 py-3"
            >
              <span className="text-[17px] text-chalk">{k.ad}</span>
              <span
                className={`flex h-11 min-w-11 items-center justify-center rounded-lg border text-base font-bold ${
                  k.sayi > 0
                    ? "border-chalk/50 text-chalk"
                    : "border-chalk/25 text-chalk/40"
                }`}
              >
                {k.sayi}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-1 items-end justify-center pb-1.5">
          <button
            type="button"
            className="flex min-h-11 items-center justify-center rounded-xl border-2 border-chalk-yellow px-10 font-marker text-[15px] text-chalk-yellow"
          >
            Kaydet
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
