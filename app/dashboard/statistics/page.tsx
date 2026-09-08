"use client";

import { useMemo, useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import TopBar from "@/components/TopBar";
import { esc, getDateKey } from "@/lib/utils";
import { PermissionStatus } from "@/types";
import { Clock, CheckCircle2, XCircle, TrendingUp } from "lucide-react";

const statusInfo: Record<PermissionStatus, { label: string; barClass: string; dotClass: string }> = {
  pending: { label: "Menunggu", barClass: "bg-amber-400", dotClass: "bg-amber-400" },
  approved: { label: "Disetujui", barClass: "bg-blue-400", dotClass: "bg-blue-400" },
  out: { label: "Sedang di Luar", barClass: "bg-green-400", dotClass: "bg-green-400" },
  returned: { label: "Sudah Kembali", barClass: "bg-slate-400", dotClass: "bg-slate-400" },
  rejected: { label: "Ditolak", barClass: "bg-red-400", dotClass: "bg-red-400" },
};

const rangeOptions = [
  { value: 7, label: "7 hari terakhir" },
  { value: 14, label: "14 hari terakhir" },
  { value: 30, label: "30 hari terakhir" },
];

function shortDayLabel(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function StatisticsPage() {
  const { permissions } = usePermissions();
  const [rangeDays, setRangeDays] = useState(14);

  // Bangun daftar tanggal untuk N hari terakhir (dari yang paling lama ke yang terbaru).
  const dayKeys = useMemo(() => {
    const keys: string[] = [];
    const pad = (n: number) => String(n).padStart(2, "0");
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      keys.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
    }
    return keys;
  }, [rangeDays]);

  const trend = useMemo(() => {
    const counts = new Map<string, number>();
    for (const key of dayKeys) counts.set(key, 0);
    for (const x of permissions) {
      const key = getDateKey(x);
      if (counts.has(key)) counts.set(key, (counts.get(key) || 0) + 1);
    }
    return dayKeys.map((key) => ({ key, count: counts.get(key) || 0 }));
  }, [permissions, dayKeys]);

  const maxTrend = Math.max(1, ...trend.map((t) => t.count));

  const statusCounts = useMemo(() => {
    const counts: Record<PermissionStatus, number> = {
      pending: 0, approved: 0, out: 0, returned: 0, rejected: 0,
    };
    for (const x of permissions) counts[x.status] = (counts[x.status] || 0) + 1;
    return counts;
  }, [permissions]);

  const total = permissions.length;

  const classCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const x of permissions) {
      const key = x.className || "Tanpa Kelas";
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [permissions]);

  const maxClass = Math.max(1, ...classCounts.map(([, c]) => c));

  const purposeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const x of permissions) {
      const key = x.purpose?.trim() || "Lainnya";
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [permissions]);

  const maxPurpose = Math.max(1, ...purposeCounts.map(([, c]) => c));

  const wentOutTotal = statusCounts.out + statusCounts.returned;
  const lateTotal = permissions.filter((x) => x.isLate).length;
  const latePct = wentOutTotal > 0 ? Math.round((lateTotal / wentOutTotal) * 100) : 0;
  const onTimePct = 100 - latePct;

  const rejectedPct = total > 0 ? Math.round((statusCounts.rejected / total) * 100) : 0;
  const completedPct = total > 0 ? Math.round((statusCounts.returned / total) * 100) : 0;

  // Ring "tepat waktu" pakai conic-gradient sederhana, tanpa library chart.
  const ringStyle = {
    background: `conic-gradient(#16a34a 0% ${onTimePct}%, #dc2626 ${onTimePct}% 100%)`,
  };

  return (
    <div>
      <TopBar
        title="Statistik"
        subtitle="Ringkasan dan tren perizinan siswa secara keseluruhan."
        permissions={permissions}
      />

      {/* Ringkasan angka */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:mb-6 lg:grid-cols-4 lg:gap-4">
        <div className="rounded-2xl border border-border bg-white p-4 shadow-soft lg:p-5">
          <div className="text-xs text-muted lg:text-sm">Total Izin Sepanjang Waktu</div>
          <div className="mt-1 text-2xl font-extrabold text-gray-900 lg:mt-2 lg:text-3xl">{total}</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 shadow-soft lg:p-5">
          <div className="flex items-center gap-1.5 text-xs text-muted lg:text-sm">
            <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />Selesai
          </div>
          <div className="mt-1 text-2xl font-extrabold text-gray-900 lg:mt-2 lg:text-3xl">{statusCounts.returned}</div>
          <div className="mt-0.5 text-[11px] text-slate-400 lg:mt-1 lg:text-xs">{completedPct}% dari total</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 shadow-soft lg:p-5">
          <div className="flex items-center gap-1.5 text-xs text-muted lg:text-sm">
            <XCircle className="h-3.5 w-3.5 text-red-400" />Ditolak
          </div>
          <div className="mt-1 text-2xl font-extrabold text-gray-900 lg:mt-2 lg:text-3xl">{statusCounts.rejected}</div>
          <div className="mt-0.5 text-[11px] text-slate-400 lg:mt-1 lg:text-xs">{rejectedPct}% dari total</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 shadow-soft lg:p-5">
          <div className="flex items-center gap-1.5 text-xs text-muted lg:text-sm">
            <Clock className="h-3.5 w-3.5 text-red-400" />Terlambat Kembali
          </div>
          <div className="mt-1 text-2xl font-extrabold text-gray-900 lg:mt-2 lg:text-3xl">{lateTotal}</div>
          <div className="mt-0.5 text-[11px] text-slate-400 lg:mt-1 lg:text-xs">{latePct}% dari yang sudah keluar</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Tren harian */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-soft lg:col-span-2 lg:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="flex items-center gap-1.5 text-base font-bold text-gray-900 sm:text-lg">
                <TrendingUp className="h-4 w-4 text-primary" />Tren Perizinan Harian
              </h2>
              <p className="mt-0.5 text-xs text-muted sm:text-sm">Jumlah izin yang dibuat per hari.</p>
            </div>
            <select
              value={rangeDays}
              onChange={(e) => setRangeDays(Number(e.target.value))}
              className="h-9 rounded-lg border border-border bg-white px-3 text-xs font-medium outline-none focus:border-primary sm:text-sm"
            >
              {rangeOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {total === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">Belum ada data untuk ditampilkan.</div>
          ) : (
            <div className="flex h-48 items-end gap-1.5 overflow-x-auto sm:gap-2">
              {trend.map((t) => (
                <div key={t.key} className="flex min-w-[20px] flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-36 w-full items-end justify-center">
                    <div
                      title={`${shortDayLabel(t.key)}: ${t.count} izin`}
                      className="w-full max-w-[26px] rounded-t-md bg-primary/80 transition-all hover:bg-primary"
                      style={{ height: `${Math.max(4, (t.count / maxTrend) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 sm:text-[10px]">{shortDayLabel(t.key)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ketepatan waktu */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-soft lg:p-6">
          <h2 className="text-base font-bold text-gray-900 sm:text-lg">Ketepatan Waktu Kembali</h2>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">Dari siswa yang sudah keluar sekolah.</p>

          {wentOutTotal === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">Belum ada siswa yang keluar.</div>
          ) : (
            <div className="mt-5 flex flex-col items-center">
              <div className="relative flex h-36 w-36 items-center justify-center rounded-full" style={ringStyle}>
                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-2xl font-extrabold text-gray-900">{onTimePct}%</span>
                  <span className="text-[10px] text-slate-400">Tepat waktu</span>
                </div>
              </div>
              <div className="mt-4 flex w-full justify-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-600" />Tepat waktu ({wentOutTotal - lateTotal})
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-600" />Terlambat ({lateTotal})
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Distribusi status */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-soft lg:p-6">
          <h2 className="text-base font-bold text-gray-900 sm:text-lg">Distribusi Status</h2>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">Seluruh izin berdasarkan status saat ini.</p>

          <div className="mt-4 space-y-3">
            {(Object.keys(statusInfo) as PermissionStatus[]).map((status) => {
              const count = statusCounts[status];
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-slate-600">
                      <span className={`h-2 w-2 rounded-full ${statusInfo[status].dotClass}`} />
                      {statusInfo[status].label}
                    </span>
                    <span className="text-slate-400">{count} · {pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${statusInfo[status].barClass}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top kelas */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-soft lg:p-6">
          <h2 className="text-base font-bold text-gray-900 sm:text-lg">Kelas Paling Sering Izin</h2>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">Diurutkan dari jumlah izin terbanyak.</p>

          {classCounts.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">Belum ada data.</div>
          ) : (
            <div className="mt-4 space-y-3">
              {classCounts.map(([className, count]) => (
                <div key={className}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{esc(className)}</span>
                    <span className="text-slate-400">{count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(count / maxClass) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alasan izin terbanyak */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-soft lg:p-6">
          <h2 className="text-base font-bold text-gray-900 sm:text-lg">Keperluan Izin Terbanyak</h2>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">Alasan izin yang paling sering diajukan.</p>

          {purposeCounts.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">Belum ada data.</div>
          ) : (
            <div className="mt-4 space-y-3">
              {purposeCounts.map(([purpose, count]) => (
                <div key={purpose}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="truncate pr-2 font-medium text-slate-600">{esc(purpose)}</span>
                    <span className="flex-none text-slate-400">{count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-blue-400" style={{ width: `${(count / maxPurpose) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
