"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import TopBar from "@/components/TopBar";
import StatsCards from "@/components/StatsCards";
import DataTable from "@/components/DataTable";
import Link from "next/link";
import { Plus, AlertTriangle, Search } from "lucide-react";
import { getDateKey, getTodayKey } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const { permissions, approvePermission, rejectPermission } = usePermissions();
  const isGuru = user?.role === "guru";
  const [filterClass, setFilterClass] = useState("");
  const [filterName, setFilterName] = useState("");

  // Dashboard hanya menampilkan data hari ini; begitu tanggal berganti, otomatis kembali ke 0.
  const [todayKey, setTodayKey] = useState(getTodayKey);

  useEffect(() => {
    // Cek tiap menit kalau-kalau tab dibiarkan terbuka melewati tengah malam.
    const interval = setInterval(() => {
      const current = getTodayKey();
      setTodayKey((prev) => (prev === current ? prev : current));
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const todaysPermissions = useMemo(
    () => permissions.filter((x) => getDateKey(x) === todayKey),
    [permissions, todayKey]
  );

  const lateStudents = todaysPermissions.filter((x) => x.status === "out" && x.isLate);

  const filtered = todaysPermissions.filter((x) => {
    const matchClass = !filterClass || x.className.toLowerCase().includes(filterClass.toLowerCase());
    const matchName = !filterName || x.name.toLowerCase().includes(filterName.toLowerCase());
    return matchClass && matchName;
  });

  return (
    <div>
      <TopBar
        title="Dashboard"
        subtitle="Pantau aktivitas perizinan siswa hari ini."
        permissions={todaysPermissions}
      />

      {lateStudents.length > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 sm:mb-5">
          <AlertTriangle className="h-5 w-5 flex-none text-red-600" />
          <div>
            <b className="text-sm text-red-800">{lateStudents.length} siswa terlambat kembali!</b>
            <p className="text-xs text-red-600">Segera follow-up siswa yang melewati batas waktu.</p>
          </div>
        </div>
      )}

      <StatsCards permissions={todaysPermissions} />

      {/* Filter */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
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

      {isGuru && (
        <div className="rounded-2xl border border-border bg-white p-4 shadow-soft sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 sm:text-lg">Aktivitas Perizinan Terbaru</h2>
              <p className="mt-0.5 text-xs text-muted sm:mt-1 sm:text-sm">Guru piket dapat memantau seluruh proses.</p>
            </div>
            <Link
              href="/dashboard/permission"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white active:bg-primary-dark"
            >
              <Plus className="h-4 w-4" />
              Buat Izin
            </Link>
          </div>
          <DataTable
            permissions={filtered}
            view="teacher"
            onApprove={approvePermission}
            onReject={rejectPermission}
          />
        </div>
      )}

      {!isGuru && (
        <div className="rounded-2xl border border-border bg-white p-4 shadow-soft sm:p-6">
          <div className="mb-4 sm:mb-5">
            <h2 className="text-base font-bold text-gray-900 sm:text-lg">Antrian Siswa Berizin</h2>
            <p className="mt-0.5 text-xs text-muted sm:mt-1 sm:text-sm">
              Lihat status siswa yang sedang berizin. Ambil foto keluar/masuk di halaman Pemantauan.
            </p>
          </div>
          <DataTable permissions={filtered} view="guard" allowCapture={false} />
        </div>
      )}
    </div>
  );
}
