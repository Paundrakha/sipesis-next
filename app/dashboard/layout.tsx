"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <div className="text-muted">Memuat...</div>
      </div>
    );
  }

  if (!user) return null;

return (
  <div className="min-h-screen w-full">
    <Sidebar />

    <main className="w-full min-w-0 px-3 pb-6 pt-16 sm:px-4 lg:ml-64 lg:w-[calc(100%-16rem)] lg:p-7 lg:pt-7">
      {children}
    </main>
  </div>
);