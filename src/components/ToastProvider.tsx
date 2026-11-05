"use client";

import { Toaster } from "sonner";

/** App-wide toast host (Sonner). Rendered once in the root layout. */
export default function ToastProvider() {
  return <Toaster position="bottom-right" richColors closeButton duration={4000} />;
}
