import React, { useEffect } from "react";

export default function AfterSignupModal({ open, userName = "", onClose }) {
  // basic ESC & outside click handlers
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  const stop = (e) => e.stopPropagation();

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div
        onClick={stop}
        role="dialog"
        aria-modal="true"
        className="relative w-[92vw] max-w-md rounded-2xl border border-white/25 bg-white/70 backdrop-blur-xl shadow-xl p-6"
      >
        {/* Accent pill */}
        <div className="absolute -top-3 left-4 rounded-full bg-gradient-to-r from-[#8DB600] to-[#C1272D] text-white text-xs px-2 py-0.5 shadow">
          Welcome
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-[#3B3C36]">
          {userName ? `Welcome, ${userName}!` : "Welcome!"}
        </h2>

        {/* Description */}
        <p className="mt-2 text-sm text-[#3B3C36]/80">
          Your account is all set. Explore featured creators, courses and
          upcoming modules on our landing page.
        </p>

        {/* CTA */}
        <div className="mt-5 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 border border-[#3B3C36]/20 bg-white/80 hover:bg-white transition"
          >
            Close
          </button>
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-white"
            style={{ background: "linear-gradient(90deg,#8DB600,#C1272D)" }}
          >
            See more
          </button>
        </div>
      </div>
    </div>
  );
}
