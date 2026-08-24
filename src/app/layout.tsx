import type { Metadata } from "next";
import { Permanent_Marker, Kalam } from "next/font/google";
import "./globals.css";

const permanentMarker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-marker",
});

const kalam = Kalam({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-kalam",
});

export const metadata: Metadata = {
  title: "YKS Takip",
  description: "Günlük çalışma, deneme ve hedef takibi.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${permanentMarker.variable} ${kalam.variable} h-full antialiased`}
    >
      <body className="chalkboard-bg min-h-full font-kalam text-chalk">
        <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
