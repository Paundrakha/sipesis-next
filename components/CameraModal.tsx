"use client";

import { useRef, useState, useCallback } from "react";
import { X, Camera } from "lucide-react";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

export default function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState("");

  const startCamera = useCallback(async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Browser/perangkat ini tidak mendukung akses kamera.");
      return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "user" } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError("Kamera tidak dapat diakses. Pastikan izin kamera diberikan. Detail: " + msg);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  const handleClose = () => {
    stopCamera();
    setError("");
    onClose();
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      setError("Kamera belum siap. Tunggu sebentar.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    onCapture(dataUrl);
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/70 p-0 sm:items-center sm:p-5">
      <div className="flex h-[85vh] w-full flex-col rounded-t-2xl bg-white p-4 shadow-2xl sm:h-auto sm:max-w-lg sm:rounded-2xl sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Foto Siswa</h3>
          <button onClick={handleClose} className="rounded-lg p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {!stream && !error && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8">
            <p className="text-sm text-gray-500">Kamera perlu diaktifkan terlebih dahulu.</p>
            <button
              onClick={startCamera}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white active:bg-primary-dark"
            >
              <Camera className="h-4 w-4" />
              Buka Kamera
            </button>
          </div>
        )}

        {error && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {stream && (
          <>
            <div className="flex-1 overflow-hidden rounded-2xl bg-slate-900 sm:aspect-[4/3] sm:flex-none">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={handleClose}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 active:bg-slate-200"
              >
                Batal
              </button>
              <button
                onClick={capture}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white active:bg-primary-dark"
              >
                <Camera className="h-4 w-4" />
                Ambil Foto
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
