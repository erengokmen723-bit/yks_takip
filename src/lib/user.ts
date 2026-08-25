"use client";

import { supabase } from "./supabase";

const STORAGE_KEY = "yks-takip-kullanici";

export type Kullanici = { id: string; isim: string };

function sahteEmail(isim: string) {
  return `${isim.trim().toLowerCase().replace(/\s+/g, "-")}@yks-takip.local`;
}

export function getStoredUser(): Kullanici | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Kullanici) : null;
}

function storeUser(user: Kullanici) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export async function kayitOl(isim: string, sifre: string): Promise<Kullanici> {
  const temiz = isim.trim();

  const { data, error } = await supabase.auth.signUp({
    email: sahteEmail(temiz),
    password: sifre,
    options: { data: { isim: temiz } },
  });
  if (error) throw error;
  if (!data.user) throw new Error("Kayıt tamamlanamadı");

  const { error: profilHata } = await supabase
    .from("kullanicilar")
    .insert({ id: data.user.id, isim: temiz });
  if (profilHata) throw profilHata;

  const kullanici: Kullanici = { id: data.user.id, isim: temiz };
  storeUser(kullanici);
  return kullanici;
}

export async function girisYap(isim: string, sifre: string): Promise<Kullanici> {
  const temiz = isim.trim();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: sahteEmail(temiz),
    password: sifre,
  });
  if (error) throw error;

  const kullanici: Kullanici = { id: data.user.id, isim: temiz };
  storeUser(kullanici);
  return kullanici;
}
