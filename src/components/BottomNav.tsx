import Link from "next/link";

function IconWrap({
  active,
  children,
}: {
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex h-11 w-11 items-center justify-center rounded-full ${
        active ? "bg-white/10" : ""
      }`}
    >
      {children}
    </div>
  );
}

export function BottomNav({ active }: { active?: "home" }) {
  return (
    <nav className="wood-bg flex items-center justify-around border-t-2 border-black/25 py-1">
      <Link href="/anasayfa" aria-label="Anasayfa">
        <IconWrap active={active === "home"}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f2efe4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11.5 12 4l9 7.5" />
            <path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9" />
          </svg>
        </IconWrap>
      </Link>

      <Link href="/ekle/soru" aria-label="Soru ekle">
        <IconWrap>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f2efe4" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v8M8 12h8" />
          </svg>
        </IconWrap>
      </Link>

      <Link href="/ekle/deneme" aria-label="Deneme ekle">
        <IconWrap>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f2efe4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19V5" />
            <path d="M4 19h16" />
            <path d="M7 15l4-5 3 3 5-7" />
          </svg>
        </IconWrap>
      </Link>

      <Link href="/ekle/hedef" aria-label="Hedef koy">
        <IconWrap>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f2efe4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3v18" />
            <path d="M6 4h10l-2.5 3.5L16 11H6" />
          </svg>
        </IconWrap>
      </Link>
    </nav>
  );
}
