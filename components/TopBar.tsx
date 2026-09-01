"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Permission } from "@/types";
import { esc } from "@/lib/utils";

interface TopBarProps {
  title: string;
  subtitle: string;
  permissions: Permission[];
}

export default function TopBar({ title, subtitle, permissions }: TopBarProps) {
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const isSatpam = user?.role === "satpam";

  const pendingList = isSatpam
    ? permissions.filter((x) => x.status === "pending")
    : permissions.filter((x) => x.status === "approved");

  const lateList = permissions.filter((x) => x.status === "out" && x.isLate);
  const count = pendingList.length + lateList.length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  return (
    <div className="mb-5 flex items-start justify-between gap-3 lg:mb-6 lg:items-center">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">{title}</h1>
        <p className="mt-0.5 text-xs text-muted lg:mt-1 lg:text-sm">{subtitle}</p>
      </div>
      <div className="relative flex-shrink-0" ref={panelRef}>
        <button
          onClick={() => setNotifOpen((v) => !v)}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-xl shadow-soft transition-colors hover:bg-gray-50 lg:h-11 lg:w-11"
          aria-label="Notifikasi"
        >
          <Bell className="h-[18px] w-[18px] text-gray-700 lg:h-5 lg:w-5" />
          {count > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-12 w-[280px] rounded-2xl border border-border bg-white p-4 shadow-card sm:w-80">
            {lateList.length > 0 && (
              <>
                <div className="mb-2 flex items-center gap-1.5 text-red-600">
                  <Clock className="h-4 w-4" />
                  <b className="text-sm">Terlambat Kembali</b>
                </div>
                {lateList.slice(0, 3).map((x) => (
                  <div key={x.id} className="border-b border-red-100 py-2.5 text-xs">
                    <b className="block text-red-800">{esc(x.name)}</b>
                    <span className="text-red-600">Token: {x.token} · Batas: {x.deadline}</span>
                  </div>
                ))}
                <div className="my-2 border-t border-slate-100" />
              </>
            )}

            <b className="mb-2 block text-sm">
              {isSatpam ? "Permintaan izin baru" : "Persetujuan izin"}
            </b>
            {pendingList.length === 0 && lateList.length === 0 ? (
              <div className="py-3 text-xs text-slate-400">Tidak ada notifikasi baru.</div>
            ) : (
              pendingList.slice(0, 5).map((x) => (
                <div key={x.id} className="border-b border-slate-100 py-2.5 text-xs last:border-0">
                  <b className="block truncate text-gray-800">{esc(x.name)}</b>
                  <span className="block truncate text-slate-500">{esc(x.purpose)}</span>
                  {x.token && <span className="text-primary font-mono text-[10px]">{x.token}</span>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
