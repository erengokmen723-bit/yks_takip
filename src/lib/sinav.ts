// ÖSYM kesin tarihi açıklanınca burayı güncelle.
export const YKS_TARIHI = "2027-06-19";

export function yksGunSayaci(): number {
  const hedef = new Date(`${YKS_TARIHI}T00:00:00`);
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  return Math.ceil((hedef.getTime() - bugun.getTime()) / 86400000);
}
