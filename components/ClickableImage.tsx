"use client";

import { useState } from "react";
import { X, ZoomIn } from "lucide-react";

interface ClickableImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  label?: string;
}

/** Foto kecil yang bisa diklik untuk menampilkan versi lebih besar dalam lightbox. */
export default function ClickableImage({ src, alt, className, label }: ClickableImageProps) {
  const [open, setOpen] = useState(false);

  if (!src) return null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="group relative block flex-none cursor-zoom-in"
        aria-label={`Perbesar ${alt}`}
      >
        <img src={src} alt={alt} className={className} />
        <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-colors group-hover:bg-black/30">
          <ZoomIn className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
        >
          <div className="relative max-h-[90vh] max-w-[92vw]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpen(false)}
              className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={src}
              alt={alt}
              className="max-h-[90vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
            />
            {label && (
              <div className="mt-2 text-center text-sm font-medium text-white">{label}</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
