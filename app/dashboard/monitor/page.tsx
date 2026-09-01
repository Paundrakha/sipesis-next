"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import TopBar from "@/components/TopBar";
import DataTable from "@/components/DataTable";
import QRScanner from "@/components/QRscanner";
import { Search, ScanLine } from "lucide-react";

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
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleScan = (token: string) => {
    setTokenSearch(token);
  };

  const filtered = tokenSearch
    ? permissions.filter(
        (x) =>
          x.token.toLowerCase().includes(tokenSearch.toLowerCase()) ||
          x.name.toLowerCase().includes(tokenSearch.toLowerCase())
      )
    : permissions;

  return (
    <div>
      <TopBar
        title="Pemantauan"
        subtitle="Lihat status siswa dari izin hingga kembali ke sekolah."
        permissions={permissions}
      />

      {!isGuru && (
        <button
          onClick={() => setScannerOpen(true)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-soft active:bg-primary-dark"
        >
          <ScanLine className="h-4 w-4" />
          Scan QR Code Siswa
        </button>
      )}

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
              : "Scan QR atau cari nama untuk validasi siswa."}
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

      <QRScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
      />
    </div>
  );
}