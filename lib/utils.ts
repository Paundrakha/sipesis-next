import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function esc(s: string | null | undefined): string {
  return String(s ?? "").replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]!)
  );
}

/** Ambil objek Date dari sebuah data yang punya createdAt (ISO), created (string lokal), atau token (DSP-YYYYMMDD-xxx). */
export function getRecordDate(x: { createdAt?: string; created?: string; token?: string }): Date | null {
  if (x.createdAt) {
    const d = new Date(x.createdAt);
    if (!isNaN(d.getTime())) return d;
  }
  if (x.created) {
    const d = new Date(x.created);
    if (!isNaN(d.getTime())) return d;
  }
  // Fallback terakhir: token berformat DSP-YYYYMMDD-xxx sudah menyimpan tanggal pembuatan.
  if (x.token) {
    const match = x.token.match(/(\d{4})(\d{2})(\d{2})/);
    if (match) {
      const [, y, m, d2] = match;
      const year = Number(y);
      const month = Number(m);
      const day = Number(d2);
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) return date;
      }
    }
  }
  return null;
}

/** Kunci tanggal berformat YYYY-MM-DD untuk pengelompokan per hari. */
export function getDateKey(x: { createdAt?: string; created?: string; token?: string }): string {
  const d = getRecordDate(x);
  if (!d) return "unknown";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Kunci tanggal (YYYY-MM-DD) untuk hari ini, dipakai untuk membatasi data dashboard hanya hari berjalan. */
export function getTodayKey(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Label tanggal yang mudah dibaca dari kunci YYYY-MM-DD, mis. "Senin, 7 September 2026". */
export function formatDateLabel(key: string): string {
  if (key === "unknown") return "Tanggal tidak diketahui";
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
