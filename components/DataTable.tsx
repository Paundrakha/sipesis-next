"use client";

import { useState } from "react";
import { Permission, PermissionStatus } from "@/types";
import { esc } from "@/lib/utils";
import { Check, X, ArrowRight, RotateCcw, QrCode, Camera, Clock } from "lucide-react";
import QRModal from "./QRModal";
import CameraModal from "./CameraModal";

interface DataTableProps {
  permissions: Permission[];
  view: "teacher" | "guard" | "history";
  onApprove?: (id: string) => void;
  onMarkOut?: (id: string, photoOut?: string) => void;
  onMarkReturned?: (id: string, photoIn?: string) => void;
  onReject?: (id: string) => void;
}

const statusMap: Record<PermissionStatus, [string, string]> = {
  pending: ["bg-amber-100 text-amber-800", "Menunggu"],
  approved: ["bg-blue-100 text-blue-800", "Disetujui"],
  out: ["bg-green-100 text-green-800", "Sedang di luar"],
  returned: ["bg-slate-200 text-slate-700", "Sudah kembali"],
  rejected: ["bg-red-100 text-red-800", "Ditolak"],
};

function StatusBadge({ status, isLate }: { status: PermissionStatus; isLate?: boolean }) {
  const [cls, label] = statusMap[status];
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${cls}`}>
        {label}
      </span>
      {isLate && (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
          <Clock className="mr-0.5 h-3 w-3" />
          Terlambat
        </span>
      )}
    </div>
  );
}

function Avatar({ photo, name }: { photo?: string; name: string }) {
  if (photo) return <img src={photo} alt={name} className="h-9 w-9 rounded-lg object-cover" />;
  const initials = name.split(" ").map((a) => a[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-sm font-extrabold text-blue-800">
      {initials}
    </div>
  );
}

function StudentCell({ x }: { x: Permission }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar photo={x.photo} name={x.name} />
      <div className="min-w-0">
        <b className="block truncate text-sm text-gray-900">{esc(x.name)}</b>
        <div className="truncate text-[11px] text-slate-400">
          {esc(x.className)} · {esc(x.nis)}
        </div>
      </div>
    </div>
  );
}

/* ---------- MOBILE CARDS ---------- */

function TeacherMobileCard({ x, onApprove, onReject }: { x: Permission; onApprove?: (id: string) => void; onReject?: (id: string) => void }) {
  const [showQR, setShowQR] = useState(false);
  return (
    <>
      <div className="rounded-xl border border-border bg-white p-4 shadow-soft">
        <div className="flex items-start justify-between">
          <StudentCell x={x} />
          {x.token && (
            <button onClick={() => setShowQR(true)} className="ml-2 flex flex-none items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary">
              <QrCode className="h-3 w-3" />
              {x.token}
            </button>
          )}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-[11px] text-slate-400">Jam Ke-</span><p className="font-medium">{x.period}</p></div>
          <div><span className="text-[11px] text-slate-400">Status</span><p className="mt-0.5"><StatusBadge status={x.status} isLate={x.isLate} /></p></div>
          <div className="col-span-2"><span className="text-[11px] text-slate-400">Keperluan</span><p className="font-medium">{esc(x.purpose)}</p></div>
          <div className="col-span-2"><span className="text-[11px] text-slate-400">Waktu</span><p className="font-medium">{x.outTime} - {x.deadline}</p></div>
        </div>
        {x.status === "pending" && (
          <div className="mt-3 flex gap-2">
            <button onClick={() => onApprove?.(x.id)} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-green-100 py-2.5 text-xs font-bold text-green-800 active:bg-green-200">
              <Check className="h-3.5 w-3.5" />Setujui
            </button>
            <button onClick={() => onReject?.(x.id)} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-red-100 py-2.5 text-xs font-bold text-red-800 active:bg-red-200">
              <X className="h-3.5 w-3.5" />Tolak
            </button>
          </div>
        )}
      </div>
      <QRModal isOpen={showQR} onClose={() => setShowQR(false)} permissions={[x]} />
    </>
  );
}

function GuardMobileCard({ x, onApprove, onMarkOut, onMarkReturned }: {
  x: Permission; onApprove?: (id: string) => void;
  onMarkOut?: (id: string, photoOut?: string) => void;
  onMarkReturned?: (id: string, photoIn?: string) => void;
}) {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<"out" | "in">("out");

  const handleCapture = (data: string) => {
    if (cameraMode === "out") onMarkOut?.(x.id, data);
    else onMarkReturned?.(x.id, data);
    setCameraOpen(false);
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-white p-4 shadow-soft">
        <div className="flex items-start justify-between">
          <div>
            <b className="text-sm text-gray-900">{esc(x.name)}</b>
            <div className="text-[11px] text-slate-400">{esc(x.className)} · {esc(x.nis)}</div>
          </div>
          <StatusBadge status={x.status} />
        </div>
        <div className="mt-2 text-sm">
          <div className="flex items-center gap-2">
            <QrCode className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-xs font-bold text-primary">{x.token}</span>
          </div>
          <div className="mt-1"><span className="text-[11px] text-slate-400">Keperluan: </span><span className="font-medium">{esc(x.purpose)}</span></div>
          <div className="mt-0.5"><span className="text-[11px] text-slate-400">Batas: </span><span className="font-medium">{x.deadline}</span></div>
        </div>
        {x.photo && (
          <div className="mt-2">
            <span className="text-[11px] text-slate-400">Foto Guru Piket:</span>
            <img src={x.photo} alt="" className="mt-1 h-20 w-20 rounded-lg object-cover" />
          </div>
        )}
        {x.photoOut && (
          <div className="mt-2">
            <span className="text-[11px] text-slate-400">Foto Keluar:</span>
            <img src={x.photoOut} alt="" className="mt-1 h-20 w-20 rounded-lg object-cover" />
          </div>
        )}
        <div className="mt-3">
          {x.status === "pending" && (
            <button onClick={() => onApprove?.(x.id)} className="flex w-full items-center justify-center gap-1 rounded-lg bg-green-100 py-2.5 text-xs font-bold text-green-800 active:bg-green-200">
              <Check className="h-3.5 w-3.5" />Setujui
            </button>
          )}
          {x.status === "approved" && (
            <button onClick={() => { setCameraMode("out"); setCameraOpen(true); }} className="flex w-full items-center justify-center gap-1 rounded-lg bg-primary py-2.5 text-xs font-bold text-white active:bg-primary-dark">
              <Camera className="h-3.5 w-3.5" />Foto & Tandai Keluar
            </button>
          )}
          {x.status === "out" && (
            <button onClick={() => { setCameraMode("in"); setCameraOpen(true); }} className="flex w-full items-center justify-center gap-1 rounded-lg bg-green-100 py-2.5 text-xs font-bold text-green-800 active:bg-green-200">
              <RotateCcw className="h-3.5 w-3.5" />Foto & Tandai Kembali
            </button>
          )}
        </div>
      </div>
      <CameraModal isOpen={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={handleCapture} />
    </>
  );
}

function HistoryMobileCard({ x }: { x: Permission }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-soft">
      <StudentCell x={x} />
      <div className="mt-2 flex items-center gap-2">
        <QrCode className="h-3.5 w-3.5 text-primary" />
        <span className="font-mono text-xs font-bold text-primary">{x.token}</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
        <div><span className="text-[11px] text-slate-400">Keperluan</span><p className="font-medium">{esc(x.purpose)}</p></div>
        <div><span className="text-[11px] text-slate-400">Jam Ke-</span><p className="font-medium">{x.period}</p></div>
        <div className="col-span-2"><span className="text-[11px] text-slate-400">Waktu</span><p className="font-medium">{x.outTime} - {x.deadline}</p></div>
        <div><span className="text-[11px] text-slate-400">Disetujui</span><p className="font-medium">{x.approvedAt ?? "-"}</p></div>
        <div><span className="text-[11px] text-slate-400">Kembali</span><p className="font-medium">{x.returnedAt ?? "-"}</p></div>
        <div className="col-span-2"><StatusBadge status={x.status} isLate={x.isLate} /></div>
      </div>
    </div>
  );
}

/* ---------- DESKTOP TABLE (same as before with QR + late badge) ---------- */

export default function DataTable({ permissions, view, onApprove, onMarkOut, onMarkReturned, onReject }: DataTableProps) {
  const [qrPermission, setQrPermission] = useState<Permission | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<{ id: string; mode: "out" | "in" } | null>(null);

  const handleCapture = (data: string) => {
    if (!cameraTarget) return;
    if (cameraTarget.mode === "out") onMarkOut?.(cameraTarget.id, data);
    else onMarkReturned?.(cameraTarget.id, data);
    setCameraOpen(false);
    setCameraTarget(null);
  };

  if (permissions.length === 0) {
    return <div className="py-10 text-center text-sm text-slate-400">Belum ada data perizinan.</div>;
  }

  if (view === "teacher") {
    return (
      <>
        <div className="flex flex-col gap-3 lg:hidden">
          {permissions.map((x) => <TeacherMobileCard key={x.id} x={x} onApprove={onApprove} onReject={onReject} />)}
        </div>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-3 py-3">Siswa</th>
                <th className="px-3 py-3">Token</th>
                <th className="px-3 py-3">Jam Ke-</th>
                <th className="px-3 py-3">Keperluan</th>
                <th className="px-3 py-3">Waktu</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((x) => (
                <tr key={x.id} className="border-b border-slate-50">
                  <td className="px-3 py-3"><StudentCell x={x} /></td>
                  <td className="px-3 py-3">
                    {x.token && (
                      <button onClick={() => setQrPermission(x)} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary">
                        <QrCode className="h-3 w-3" />{x.token}
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-3 text-sm">{x.period}</td>
                  <td className="px-3 py-3 text-sm">{esc(x.purpose)}</td>
                  <td className="px-3 py-3 text-sm">{x.outTime} - {x.deadline}</td>
                  <td className="px-3 py-3"><StatusBadge status={x.status} isLate={x.isLate} /></td>
                  <td className="px-3 py-3">
                    {x.status === "pending" && (
                      <div className="flex gap-2">
                        <button onClick={() => onApprove?.(x.id)} className="inline-flex items-center gap-1 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-bold text-green-800 hover:bg-green-200"><Check className="h-3 w-3" />Setujui</button>
                        <button onClick={() => onReject?.(x.id)} className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold text-red-800 hover:bg-red-200"><X className="h-3 w-3" />Tolak</button>
                      </div>
                    )}
                    {x.status !== "pending" && <span className="text-xs text-slate-400">Terpantau</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <QRModal isOpen={!!qrPermission} onClose={() => setQrPermission(null)} permissions={qrPermission ? [qrPermission] : []} />
        <CameraModal isOpen={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={handleCapture} />
      </>
    );
  }

  if (view === "guard") {
    const list = permissions.filter((x) => ["pending", "approved", "out"].includes(x.status));
    if (list.length === 0) return <div className="py-10 text-center text-sm text-slate-400">Tidak ada siswa yang sedang menunggu proses di pos satpam.</div>;
    return (
      <>
        <div className="flex flex-col gap-3 lg:hidden">
          {list.map((x) => <GuardMobileCard key={x.id} x={x} onApprove={onApprove} onMarkOut={onMarkOut} onMarkReturned={onMarkReturned} />)}
        </div>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-3 py-3">Siswa</th>
                <th className="px-3 py-3">Token</th>
                <th className="px-3 py-3">Keperluan</th>
                <th className="px-3 py-3">Jam</th>
                <th className="px-3 py-3">Batas</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((x) => (
                <tr key={x.id} className="border-b border-slate-50">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar photo={x.photo} name={x.name} />
                      <div>
                        <b className="block text-sm text-gray-900">{esc(x.name)}</b>
                        <div className="text-[11px] text-slate-400">{esc(x.className)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs font-bold text-primary">{x.token}</td>
                  <td className="px-3 py-3 text-sm">{esc(x.purpose)}</td>
                  <td className="px-3 py-3 text-sm">{x.outTime}</td>
                  <td className="px-3 py-3 text-sm">{x.deadline}</td>
                  <td className="px-3 py-3"><StatusBadge status={x.status} /></td>
                  <td className="px-3 py-3">
                    {x.status === "pending" && (
                      <button onClick={() => onApprove?.(x.id)} className="inline-flex items-center gap-1 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-bold text-green-800 hover:bg-green-200"><Check className="h-3 w-3" />Setujui</button>
                    )}
                    {x.status === "approved" && (
                      <button onClick={() => { setCameraTarget({ id: x.id, mode: "out" }); setCameraOpen(true); }} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-dark"><Camera className="h-3 w-3" />Foto & Keluar</button>
                    )}
                    {x.status === "out" && (
                      <button onClick={() => { setCameraTarget({ id: x.id, mode: "in" }); setCameraOpen(true); }} className="inline-flex items-center gap-1 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-bold text-green-800 hover:bg-green-200"><RotateCcw className="h-3 w-3" />Foto & Kembali</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CameraModal isOpen={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={handleCapture} />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 lg:hidden">
        {permissions.map((x) => <HistoryMobileCard key={x.id} x={x} />)}
      </div>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1000px] border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-3 py-3">Siswa</th>
              <th className="px-3 py-3">Token</th>
              <th className="px-3 py-3">Keperluan</th>
              <th className="px-3 py-3">Jam Ke-</th>
              <th className="px-3 py-3">Waktu Izin</th>
              <th className="px-3 py-3">Disetujui</th>
              <th className="px-3 py-3">Kembali</th>
              <th className="px-3 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((x) => (
              <tr key={x.id} className="border-b border-slate-50">
                <td className="px-3 py-3"><StudentCell x={x} /></td>
                <td className="px-3 py-3 font-mono text-xs font-bold text-primary">{x.token}</td>
                <td className="px-3 py-3 text-sm">{esc(x.purpose)}</td>
                <td className="px-3 py-3 text-sm">{x.period}</td>
                <td className="px-3 py-3 text-sm">{x.outTime} - {x.deadline}</td>
                <td className="px-3 py-3 text-sm">{x.approvedAt ?? "-"}</td>
                <td className="px-3 py-3 text-sm">{x.returnedAt ?? "-"}</td>
                <td className="px-3 py-3"><StatusBadge status={x.status} isLate={x.isLate} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
