"use client";

import { supabase } from "./supabase";

const STORAGE_KEY = "yks-takip-kullanici";

export type Kullanici = { id: string; isim: string };

export function getStoredUser(): Kullanici | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Kullanici) : null;
}

function storeUser(user: Kullanici) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export async function girisYap(isim: string): Promise<Kullanici> {
  const temiz = isim.trim();

  const { data: existing } = await supabase
    .from("kullanicilar")
    .select("id, isim")
    .eq("isim", temiz)
    .maybeSingle();

  if (existing) {
    storeUser(existing);
    return existing;
  }

  const { data, error } = await supabase
    .from("kullanicilar")
    .insert({ isim: temiz })
    .select("id, isim")
    .single();

  if (error) throw error;
  storeUser(data);
  return data;
}
