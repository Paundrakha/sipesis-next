"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  visible: boolean;
  onClose?: () => void;
}

export default function Toast({ message, visible, onClose }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onClose?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!show && !visible) return null;

  return (
    <div
      className={cn(
        "fixed right-6 bottom-6 z-50 rounded-xl bg-gray-900 px-5 py-3 text-sm text-white shadow-card transition-all duration-300",
        show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
    >
      {message}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
