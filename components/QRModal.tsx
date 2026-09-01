"use client";

import { useEffect, useRef } from "react";
import { X, Printer, Download } from "lucide-react";
import { Permission } from "@/types";

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissions: Permission[];
}

export default function QRModal({ isOpen, onClose, permissions }: QRModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen || !canvasRef.current || permissions.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 280;
    canvas.width = size;
    canvas.height = size;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    // Draw simple QR-like pattern
    const cell = size / 25;
    const token = permissions[0].token;

    // Border
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, size - 16, size - 16);

    // Position markers (corners)
    const drawMarker = (x: number, y: number) => {
      ctx.fillStyle = "#000";
      ctx.fillRect(x, y, cell * 5, cell * 5);
      ctx.fillStyle = "#fff";
      ctx.fillRect(x + cell, y + cell, cell * 3, cell * 3);
      ctx.fillStyle = "#000";
      ctx.fillRect(x + cell * 2, y + cell * 2, cell, cell);
    };
    drawMarker(cell * 2, cell * 2);
    drawMarker(size - cell * 7, cell * 2);
    drawMarker(cell * 2, size - cell * 7);

    // Random data pattern based on token
    ctx.fillStyle = "#000";
    for (let i = 0; i < token.length; i++) {
      const code = token.charCodeAt(i);
      const x = (i % 15) + 7;
      const y = Math.floor(i / 15) + 7;
      if (code % 2 === 0) {
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }

    // Token text below
    ctx.fillStyle = "#000";
    ctx.font = "bold 16px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(token, size / 2, size - 20);
  }, [isOpen, permissions]);

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>QR ${permissions[0]?.token}</title></head>
      <body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;">
        <img src="${url}" style="max-width:90vw;max-height:90vh;" />
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-${permissions[0]?.token}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (!isOpen || permissions.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/70 p-0 sm:items-center sm:p-5">
      <div className="flex w-full max-w-sm flex-col rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Token Izin Keluar</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="rounded-xl border-2 border-dashed border-slate-200 p-4">
            <canvas ref={canvasRef} className="h-[220px] w-[220px] sm:h-[280px] sm:w-[280px]" />
          </div>

          <div className="text-center">
            <p className="text-2xl font-extrabold tracking-wider text-gray-900">
              {permissions[0].token}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Tunjukkan QR/token ini ke satpam saat keluar
            </p>
          </div>

          <div className="w-full rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-600">Siswa yang diizinkan:</p>
            <ul className="mt-1 space-y-0.5">
              {permissions.map((p) => (
                <li key={p.id} className="text-xs text-slate-700">
                  • {p.name} ({p.className})
                </li>
              ))}
            </ul>
          </div>

          <div className="flex w-full gap-2">
            <button
              onClick={handlePrint}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-white active:bg-primary-dark"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-sm font-bold text-slate-700 active:bg-slate-200"
            >
              <Download className="h-4 w-4" />
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
