import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 px-8 py-10 text-center">
      <p className="text-sm tracking-wide text-chalk/55">YKS&apos;ye hazırlan</p>

      <div className="flex flex-col items-center gap-1">
        <p className="font-marker text-2xl text-chalk">Hoşgeldin,</p>
        <p className="font-marker text-5xl leading-tight text-chalk-yellow">Eren</p>
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

      <Link
        href="/anasayfa"
        className="mt-10 flex min-h-11 items-center justify-center rounded-2xl border-2 border-chalk px-12 py-3.5 font-marker text-lg text-chalk transition-colors hover:bg-chalk/5"
      >
        Başla →
      </Link>
    </main>
  );
}
