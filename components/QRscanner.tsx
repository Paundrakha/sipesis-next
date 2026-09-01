"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, ScanLine } from "lucide-react";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (token: string) => void;
}

export default function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const [error, setError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !divRef.current) return;

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText);
          scanner.stop().then(() => onClose());
        },
        () => {}
      )
      .catch((err) => {
        setError("Kamera tidak dapat diakses: " + err);
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isOpen, onScan, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/80 p-0 sm:items-center sm:p-5">
      <div className="flex h-[85vh] w-full flex-col rounded-t-2xl bg-white p-4 shadow-2xl sm:h-auto sm:max-w-md sm:rounded-2xl sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-primary" />
            Scan QR Siswa
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <div id="qr-reader" ref={divRef} className="overflow-hidden rounded-xl" />
        )}

        <p className="mt-3 text-center text-xs text-slate-400">
          Arahkan kamera ke QR code surat dispensasi siswa
        </p>
      </div>
    </div>
  );
}