"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { firebaseLogin } from "@/lib/auth";
import { UserRole } from "@/types";
import { Shield, GraduationCap, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [role, setRole] = useState<UserRole>("satpam");
  const [username, setUsername] = useState("satpam");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    setUsername(role === "guru" ? "faraday" : "satpam");
    setError("");
  }, [role]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      const userData = await firebaseLogin(
        username.trim().toLowerCase(),
        password,
        role,
      );
      setUser(userData);
      router.replace("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const code = (err as { code?: string }).code;

      let message = "Login gagal. Periksa username dan password.";
      if (msg === "USERNAME_TIDAK_DITEMUKAN")
        message = "Username tidak ditemukan.";
      else if (msg === "DATA_USER_TIDAK_DITEMUKAN")
        message = "Data pengguna belum terdaftar di Firestore.";
      else if (msg === "USERNAME_TIDAK_SESUAI")
        message = "Username tidak sesuai dengan akun Firebase.";
      else if (msg === "ROLE_TIDAK_SESUAI") message = "Role akun tidak sesuai.";
      else if (code === "auth/invalid-credential")
        message = "Username atau password salah.";
      else if (code === "auth/invalid-email")
        message = "Email akun Firebase tidak valid.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-8 sm:px-5 sm:py-10">
      <div className="w-full max-w-md">
        <div className="mb-7 flex flex-col items-center text-center sm:mb-8">
          <div className="mb-4 flex h-16 w-16 items-center justify-center sm:h-[70px] sm:w-[70px]">
            <Image
              src="/logo-smk.webp"
              alt="Logo SMK N 2 Klaten"
              width={70}
              height={70}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-[28px]">
            S I P E S I S
          </h1>
          <p className="mt-1 text-sm text-slate-500 sm:text-[15px]">
            Sistem Perizinan Siswa
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Login sebagai
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("satpam")}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                  role === "satpam"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-white text-slate-600 active:bg-slate-50"
                }`}
              >
                <Shield className="h-4 w-4" />
                Satpam
              </button>
              <button
                type="button"
                onClick={() => setRole("guru")}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                  role === "guru"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-white text-slate-600 active:bg-slate-50"
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                Guru Piket
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="Masukkan username"
              required
              className="h-[50px] w-full rounded-xl border border-[#dbe3ef] bg-white px-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 sm:h-[52px]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Masukkan password"
                required
                className="h-[50px] w-full rounded-xl border border-[#dbe3ef] bg-white px-4 pr-11 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 sm:h-[52px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600"
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-[48px] w-full rounded-xl bg-primary text-base font-bold text-white transition active:bg-primary-dark disabled:opacity-60 sm:h-[50px] sm:text-[17px]"
          >
            {loading ? "Memuat..." : "Masuk ke Sistem"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400 sm:mt-6"></p>
      </div>
    </main>
  );
}
