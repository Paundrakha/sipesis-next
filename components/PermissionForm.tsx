"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Camera, RotateCcw, Plus, Trash2, ClipboardCheck, Check, X, Copy } from "lucide-react";
import CameraModal from "./CameraModal";
import { StudentDraft } from "@/types";

interface PermissionFormProps {
  onSubmit: (
    students: StudentDraft[],
    common: { purpose: string; period: string; outTime: string; deadline: string }
  ) => Promise<string>;
}

export default function PermissionForm({ onSubmit }: PermissionFormProps) {
  const router = useRouter();
  const [students, setStudents] = useState<StudentDraft[]>([
    { name: "", nis: "", className: "", photo: "" },
  ]);
  const [common, setCommon] = useState({
    purpose: "",
    period: "",
    outTime: "",
    deadline: "",
  });
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<{ index: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [generatedToken, setGeneratedToken] = useState("");
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const addStudent = () => {
    setStudents([...students, { name: "", nis: "", className: "", photo: "" }]);
  };

  const removeStudent = (index: number) => {
    if (students.length <= 1) return;
    setStudents(students.filter((_, i) => i !== index));
  };

  const updateStudent = (index: number, field: keyof StudentDraft, value: string) => {
    const next = [...students];
    next[index] = { ...next[index], [field]: value };
    setStudents(next);
  };

  const openCameraFor = (index: number) => {
    setCameraTarget({ index });
    setCameraOpen(true);
  };

  const handleCapture = (data: string) => {
    if (cameraTarget) {
      updateStudent(cameraTarget.index, "photo", data);
    }
    setCameraOpen(false);
    setCameraTarget(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (students.some((s) => !s.name || !s.nis || !s.className)) {
      alert("Semua data siswa wajib diisi.");
      return;
    }
    if (!common.purpose || !common.period || !common.outTime || !common.deadline) {
      alert("Semua data waktu dan keperluan wajib diisi.");
      return;
    }
    setSubmitting(true);
    try {
      const token = await onSubmit(students, common);
      setGeneratedToken(token);
      setCopied(false);
      setTokenModalOpen(true);
      setStudents([{ name: "", nis: "", className: "", photo: "" }]);
      setCommon({ purpose: "", period: "", outTime: "", deadline: "" });
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan perizinan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Common fields */}
        <div className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-border bg-slate-50 p-4 sm:grid-cols-2 sm:p-5">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-bold text-gray-700">
              Keperluan <span className="text-red-500">*</span>
            </label>
            <input
              value={common.purpose}
              onChange={(e) => setCommon({ ...common, purpose: e.target.value })}
              required
              placeholder="Contoh: Keperluan keluarga / kesehatan / administrasi"
              className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700">
              Keluar pada Jam Ke- <span className="text-red-500">*</span>
            </label>
            <select
              value={common.period}
              onChange={(e) => setCommon({ ...common, period: e.target.value })}
              required
              className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="">Pilih jam ke-</option>
              {Array.from({ length: 9 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700">
              Waktu Keluar <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={common.outTime}
              onChange={(e) => setCommon({ ...common, outTime: e.target.value })}
              required
              className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-bold text-gray-700">
              Batas Waktu Kembali <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={common.deadline}
              onChange={(e) => setCommon({ ...common, deadline: e.target.value })}
              required
              className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>

        {/* Students */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Data Siswa</h3>
            <button
              type="button"
              onClick={addStudent}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary active:bg-primary/20"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Siswa
            </button>
          </div>

          {students.map((student, idx) => (
            <div
              key={idx}
              className="relative rounded-2xl border border-border bg-white p-4 shadow-soft sm:p-5"
            >
              {students.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStudent(idx)}
                  className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <div className="mb-3 text-xs font-bold text-slate-500">
                Siswa ke-{idx + 1}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">Nama *</label>
                  <input
                    value={student.name}
                    onChange={(e) => updateStudent(idx, "name", e.target.value)}
                    required
                    placeholder="Ahmad Fauzan"
                    className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">NIS/Absen *</label>
                  <input
                    value={student.nis}
                    onChange={(e) => updateStudent(idx, "nis", e.target.value)}
                    required
                    placeholder="24015 / 12"
                    className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-gray-700">Kelas *</label>
                  <input
                    value={student.className}
                    onChange={(e) => updateStudent(idx, "className", e.target.value)}
                    required
                    placeholder="XI TKJ 1"
                    className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-gray-700">Foto</label>
                  <div className="flex items-center gap-3">
                    <div className="flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-xl bg-slate-200 text-[10px] text-slate-400">
                      {student.photo ? (
                        <img src={student.photo} alt="" className="h-full w-full object-cover" />
                      ) : (
                        "Belum"
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => openCameraFor(idx)}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white active:bg-primary-dark"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      {student.photo ? "Ulang" : "Ambil Foto"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={() => {
              setStudents([{ name: "", nis: "", className: "", photo: "" }]);
              setCommon({ purpose: "", period: "", outTime: "", deadline: "" });
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 active:bg-slate-200"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white active:bg-primary-dark disabled:opacity-60"
          >
            <ClipboardCheck className="h-4 w-4" />
            {submitting ? "Memproses..." : "Buat Izin"}
          </button>
        </div>
      </form>

      <CameraModal
        isOpen={cameraOpen}
        onClose={() => { setCameraOpen(false); setCameraTarget(null); }}
        onCapture={handleCapture}
      />

      {tokenModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/70 p-0 sm:items-center sm:p-5">
          <div className="flex w-full max-w-sm flex-col rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Izin Berhasil Dibuat</h3>
              <button onClick={() => setTokenModalOpen(false)} className="rounded-lg p-1 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-3">
              <p className="text-xs text-slate-500">Token izin keluar siswa</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-extrabold tracking-wider text-gray-900">{generatedToken}</p>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(generatedToken);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-gray-100"
                  aria-label="Salin token"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-center text-xs text-slate-500">
                Sebutkan atau tunjukkan token ini ke satpam saat siswa keluar.
              </p>

              <button
                onClick={() => setTokenModalOpen(false)}
                className="mt-2 w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white active:bg-primary-dark"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
