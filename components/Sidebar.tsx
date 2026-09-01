"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  PlusCircle,
  Eye,
  History,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/permission", label: "Perizinan", icon: PlusCircle, guruOnly: true },
  { href: "/dashboard/monitor", label: "Pemantauan", icon: Eye },
  { href: "/dashboard/history", label: "Riwayat", icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isGuru = user?.role === "guru";

  const filteredNav = navItems.filter(
    (item) => !item.guruOnly || isGuru
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar text-white shadow-lg lg:hidden"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-white transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-extrabold">
                SK
              </div>
              <div>
                <b className="block text-lg leading-tight">SIPKEL</b>
                <small className="text-[11px] text-slate-400">
                  Perizinan Siswa SMK
                </small>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-white/10 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 rounded-xl bg-sidebar-light p-3 text-sm">
            <b className="block">{isGuru ? "Guru Piket" : "Satpam"}</b>
            <span className="mt-1 block text-xs text-slate-400">
              {user?.username}
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {filteredNav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition-colors",
                  active
                    ? "bg-[#1e3a66] text-white"
                    : "hover:bg-[#1e3a66] hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 flex-none" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-6 pt-2">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 px-3 py-3 text-sm text-slate-300 transition-colors hover:bg-white/5"
          >
            <LogOut className="h-4 w-4 flex-none" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
