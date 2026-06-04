"use client";

import { useEffect, useState } from "react";
import { X, Share } from "lucide-react";

const STORAGE_KEY = "standpoint_ath_dismissed";
const DISMISS_MS  = 7 * 24 * 60 * 60 * 1000; // 7 days

type Platform = "android" | "ios" | null;

function detectPlatform(): Platform {
  if (typeof window === "undefined") return null;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return null;
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.navigator as any).standalone === true
  );
}

function wasDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < DISMISS_MS;
  } catch {
    return false;
  }
}

export function AddToHomeScreen() {
  const [visible,  setVisible]  = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (isStandalone() || wasDismissedRecently()) return;

    const p = detectPlatform();
    if (!p) return; // desktop — don't show

    if (p === "android") {
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setPlatform("android");
        setVisible(true);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }

    if (p === "ios") {
      // Slight delay so the page is settled before the banner appears
      const t = setTimeout(() => {
        setPlatform("ios");
        setVisible(true);
      }, 2500);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
    setVisible(false);
  };

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setDeferredPrompt(null);
    }
    dismiss();
  };

  if (!visible) return null;

  return (
    <>
      {/* Scrim */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        aria-hidden
        onClick={dismiss}
      />

      {/* Bottom sheet */}
      <div
        role="dialog"
        aria-label="Add to Home Screen"
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl px-5 pt-5 pb-8 animate-slide-up-sheet"
        style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* App icon */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-2xl"
              style={{ background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)", fontFamily: "Georgia, serif" }}
              aria-hidden
            >
              S
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base leading-tight">Standpoint</p>
              <p className="text-xs text-gray-500 mt-0.5">standpointapp.com</p>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 -mt-1 -mr-1"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed mb-5">
          Add Standpoint to your home screen for quick access to your reviews and team performance.
        </p>

        {platform === "android" && (
          <button
            type="button"
            onClick={install}
            className="w-full bg-[#4f46e5] text-white font-semibold py-3.5 rounded-xl text-sm hover:bg-[#4338ca] active:bg-[#3730a3] transition-colors"
          >
            Install App
          </button>
        )}

        {platform === "ios" && (
          <div className="bg-gray-50 rounded-xl px-4 py-3.5 flex items-center gap-3">
            <Share className="w-5 h-5 text-[#4f46e5] flex-shrink-0" />
            <p className="text-sm text-gray-700 leading-snug">
              Tap <strong>Share</strong> then <strong>&ldquo;Add to Home Screen&rdquo;</strong>
            </p>
          </div>
        )}
      </div>
    </>
  );
}
