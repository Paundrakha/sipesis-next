"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import TopBar from "@/components/TopBar";
import PermissionForm from "@/components/PermissionForm";

export default function PermissionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { permissions, createGroupPermission } = usePermissions();

  useEffect(() => {
    if (user?.role !== "guru") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (user?.role !== "guru") return null;

  return (
    <div>
      <TopBar
        title="Perizinan Siswa"
        subtitle="Buat izin keluar untuk satu atau beberapa siswa."
        permissions={permissions}
      />
      <div className="rounded-2xl border border-border bg-white p-4 shadow-soft sm:p-6">
        <div className="mb-5 sm:mb-6">
          <h2 className="text-base font-bold text-gray-900 sm:text-lg">Form Perizinan Siswa Keluar</h2>
          <p className="mt-0.5 text-xs text-muted sm:mt-1 sm:text-sm">
            Isi data keperluan, lalu tambahkan satu atau lebih siswa. Sistem akan generate token unik.
          </p>
        </div>
        <PermissionForm onSubmit={createGroupPermission} />
      </div>
    </div>
  );
}
