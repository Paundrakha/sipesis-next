"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import TopBar from "@/components/TopBar";
import DataTable from "@/components/DataTable";
import { Search, Calendar } from "lucide-react";
import { getDateKey, formatDateLabel } from "@/lib/utils";
import { Permission } from "@/types";

export default function HistoryPage() {
  const { user } = useAuth();
  const { permissions } = usePermissions();
  const [filterName, setFilterName] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [selectedDate, setSelectedDate] = useState("all");

  const filtered = permissions.filter((x) => {
    const matchName = !filterName || x.name.toLowerCase().includes(filterName.toLowerCase());
    const matchClass = !filterClass || x.className.toLowerCase().includes(filterClass.toLowerCase());
    return matchName && matchClass;
  });

  // Kelompokkan hasil filter berdasarkan tanggal (YYYY-MM-DD), terbaru di atas.
  const groups = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const x of filtered) {
      const key = getDateKey(x);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(x);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  const visibleGroups = selectedDate === "all" ? groups : groups.filter(([key]) => key === selectedDate);

  return (
    <div>
      <TopBar
        title="Riwayat Perizinan"
        subtitle="Lihat riwayat perizinan siswa per hari."
        permissions={permissions}
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="Cari nama siswa..."
            className="h-10 w-full rounded-xl border border-border bg-white pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <input
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          placeholder="Filter kelas..."
          className="h-10 rounded-xl border border-border bg-white px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 sm:w-48"
        />
        <div className="relative sm:w-56">
          <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-10 w-full appearance-none rounded-xl border border-border bg-white pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          >
            <option value="all">Semua tanggal</option>
            {groups.map(([key]) => (
              <option key={key} value={key}>
                {formatDateLabel(key)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {visibleGroups.length === 0 && (
        <div className="rounded-2xl border border-border bg-white p-8 text-center text-sm text-slate-400 shadow-soft">
          Belum ada data perizinan.
        </div>
      )}

      <div className="space-y-4">
        {visibleGroups.map(([key, items]) => (
          <div key={key} className="rounded-2xl border border-border bg-white p-4 shadow-soft sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 sm:mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900 sm:text-lg">{formatDateLabel(key)}</h2>
                <p className="mt-0.5 text-xs text-muted sm:mt-1 sm:text-sm">Aktivitas perizinan siswa pada hari ini.</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {items.length} izin
              </span>
            </div>
            <DataTable permissions={items} view="history" />
          </div>
        ))}
      </div>
    </div>
  );
}
