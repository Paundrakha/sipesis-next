"use client";

import { useRef, useState, useEffect } from "react";
import { X, Camera, RefreshCw } from "lucide-react";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

export default function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [switching, setSwitching] = useState(false);

  // Simpan callback di ref agar tidak trigger re-render
  const onCaptureRef = useRef(onCapture);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCaptureRef.current = onCapture;
    onCloseRef.current = onClose;
  }, [onCapture, onClose]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
    }
    setIsReady(false);
  };

  const startCamera = async () => {
    setError("");
    setIsReady(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Browser tidak mendukung kamera. Gunakan Chrome/Safari terbaru.");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = mediaStream;

      const video = videoRef.current;
      if (video) {
        video.srcObject = mediaStream;
        video.onloadedmetadata = () => {
          video.play().then(() => setIsReady(true)).catch(() => setIsReady(true));
        };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Permission") || msg.includes("NotAllowed")) {
        setError("Izin kamera ditolak. Izinkan akses kamera di pengaturan browser.");
      } else if (msg.includes("NotFound")) {
        setError("Kamera tidak ditemukan.");
      } else {
        setError("Gagal akses kamera: " + msg);
      }
    }
  };

  // Hanya jalan saat isOpen atau facingMode BERUBAH
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => startCamera(), 200);
      return () => clearTimeout(timer);
    } else {
      stopCamera();
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, facingMode]);

  // Cleanup saat unmount
  useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    stopCamera();
    setError("");
    onCloseRef.current();
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !isReady || video.videoWidth === 0) {
      setError("Kamera belum siap. Tunggu sebentar.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    onCaptureRef.current(dataUrl);
    stopCamera();
    onCloseRef.current();
  };

  const switchCamera = () => {
    if (switching) return;
    setSwitching(true);
    stopCamera();
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setTimeout(() => setSwitching(false), 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-0 sm:items-center sm:p-4">
      <div className="flex h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:h-auto sm:max-w-lg sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h3 className="text-base font-bold text-gray-900 sm:text-lg">Ambil Foto</h3>
          <button onClick={handleClose} className="rounded-lg p-2 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
            <button
              onClick={startCamera}
              className="mt-2 block w-full rounded-lg bg-red-100 py-2 text-center text-xs font-bold text-red-800"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Video Container */}
        <div className="relative flex-1 overflow-hidden bg-black sm:aspect-[4/3] sm:flex-none">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            disablePictureInPicture
            controls={false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transform: facingMode === "user" ? "scaleX(-1)" : "none",
            }}
          />

          {/* Loading overlay */}
          {!isReady && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <p className="mt-3 text-sm">Memuat kamera...</p>
            </div>
          )}

          {/* Switch camera */}
          <button
            onClick={switchCamera}
            disabled={switching}
            className="absolute right-3 top-3 rounded-full bg-black/50 p-2.5 text-white backdrop-blur-sm active:bg-black/70 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${switching ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 px-4 py-4">
          <button
            onClick={handleClose}
            className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 active:bg-slate-200"
          >
            Batal
          </button>
          <button
            onClick={capture}
            disabled={!isReady}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white disabled:opacity-50 active:bg-primary-dark"
          >
            <Camera className="h-4 w-4" />
            {isReady ? "Ambil Foto" : "Menyiapkan..."}
          </button>
        </div>
      </div>
    </div>
  );
}