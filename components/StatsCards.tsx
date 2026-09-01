"use client";

import { Permission } from "@/types";
import { Clock } from "lucide-react";

interface StatsCardsProps {
  permissions: Permission[];
}

export default function StatsCards({ permissions }: StatsCardsProps) {
  const total = permissions.length;
  const pending = permissions.filter((x) => x.status === "pending").length;
  const out = permissions.filter((x) => x.status === "out").length;
  const returned = permissions.filter((x) => x.status === "returned").length;
  const late = permissions.filter((x) => x.status === "out" && x.isLate).length;

  const stats = [
    { label: "Total Izin", value: total, hint: "Semua permohonan" },
    { label: "Menunggu", value: pending, hint: "Belum diproses" },
    { label: "Sedang di Luar", value: out, hint: "Belum kembali" },
    { label: "Sudah Kembali", value: returned, hint: "Selesai" },
  ];

  return (
    <div className="mb-5 grid grid-cols-2 gap-3 lg:mb-6 lg:grid-cols-4 lg:gap-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-border bg-white p-4 shadow-soft lg:p-5">
          <div className="text-xs text-muted lg:text-sm">{s.label}</div>
          <div className="mt-1 text-2xl font-extrabold text-gray-900 lg:mt-2 lg:text-3xl">{s.value}</div>
          <div className="mt-0.5 text-[11px] text-slate-400 lg:mt-1 lg:text-xs">{s.hint}</div>
        </div>
      ))}
      {late > 0 && (
        <div className="col-span-2 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-soft lg:col-span-4 lg:p-5">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-red-600" />
            <div>
              <div className="text-xs font-bold text-red-700 lg:text-sm">{late} Siswa Terlambat</div>
              <div className="text-[11px] text-red-600 lg:text-xs">Melewati batas waktu kembali</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
