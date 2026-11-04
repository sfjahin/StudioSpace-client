"use client";

import { ToastContainer } from "react-toastify";

/** App-wide toast host (react-toastify). Rendered once in the root layout. */
export default function ToastProvider() {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="light"
    />
  );
}
