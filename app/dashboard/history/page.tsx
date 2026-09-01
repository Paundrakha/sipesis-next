"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import TopBar from "@/components/TopBar";
import DataTable from "@/components/DataTable";
import { Search } from "lucide-react";

export default function HistoryPage() {
  const { user } = useAuth();
  const { permissions } = usePermissions();
  const [filterName, setFilterName] = useState("");
  const [filterClass, setFilterClass] = useState("");

  const filtered = permissions.filter((x) => {
    const matchName = !filterName || x.name.toLowerCase().includes(filterName.toLowerCase());
    const matchClass = !filterClass || x.className.toLowerCase().includes(filterClass.toLowerCase());
    return matchName && matchClass;
  });

  return (
    <div>
      <TopBar
        title="Riwayat Perizinan"
        subtitle="Lihat seluruh riwayat perizinan siswa."
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
      </div>

      <div className="rounded-2xl border border-border bg-white p-4 shadow-soft sm:p-6">
        <div className="mb-4 sm:mb-5">
          <h2 className="text-base font-bold text-gray-900 sm:text-lg">Riwayat Perizinan</h2>
          <p className="mt-0.5 text-xs text-muted sm:mt-1 sm:text-sm">Daftar seluruh aktivitas perizinan siswa.</p>
        </div>
        <DataTable permissions={filtered} view="history" />
      </div>
    </div>
  );
}
