"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import TopBar from "@/components/TopBar";
import DataTable from "@/components/DataTable";
import { Search } from "lucide-react";
import { getDateKey, getTodayKey } from "@/lib/utils";

export default function MonitorPage() {
  const { user } = useAuth();
  const {
    permissions,
    approvePermission,
    markOut,
    markReturned,
    rejectPermission,
  } = usePermissions();
  const isGuru = user?.role === "guru";

  const [tokenSearch, setTokenSearch] = useState("");

  // Pemantauan hanya menampilkan data hari ini; begitu tanggal berganti, otomatis kembali ke 0.
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

  const filtered = tokenSearch
    ? todaysPermissions.filter(
        (x) =>
          x.token.toLowerCase().includes(tokenSearch.toLowerCase()) ||
          x.name.toLowerCase().includes(tokenSearch.toLowerCase())
      )
    : todaysPermissions;

  return (
    <div>
      <TopBar
        title="Pemantauan"
        subtitle="Lihat status siswa dari izin hingga kembali ke sekolah hari ini."
        permissions={todaysPermissions}
      />

      {!isGuru && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={tokenSearch}
              onChange={(e) => setTokenSearch(e.target.value)}
              placeholder="Cari token atau nama siswa..."
              className="h-11 w-full rounded-xl border border-border bg-white pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-white p-4 shadow-soft sm:p-6">
        <div className="mb-4 sm:mb-5">
          <h2 className="text-base font-bold text-gray-900 sm:text-lg">
            {isGuru ? "Pemantauan Siswa" : "Validasi di Pos Satpam"}
          </h2>
          <p className="mt-0.5 text-xs text-muted sm:mt-1 sm:text-sm">
            {isGuru
              ? "Status perizinan dan keberadaan siswa."
              : "Cari token atau nama untuk validasi siswa."}
          </p>
        </div>
        <DataTable
          permissions={filtered}
          view={isGuru ? "teacher" : "guard"}
          onApprove={approvePermission}
          onMarkOut={markOut}
          onMarkReturned={markReturned}
          onReject={rejectPermission}
        />
      </div>
    </div>
  );
}