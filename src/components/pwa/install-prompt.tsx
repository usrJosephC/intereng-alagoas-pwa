"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const ELIGIBLE_KEY = "intereng-install-eligible";
const DONE_KEY = "intereng-install-dismissed";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function installed() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function iosSafari() {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) &&
    /Safari/.test(ua) &&
    !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
}

export function InstallPrompt() {
  const [eligible, setEligible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<InstallEvent | null>(null);
  const [hidden, setHidden] = useState(true);
  const isIosSafari = typeof navigator !== "undefined" && iosSafari();

  useEffect(() => {
    const refresh = () => {
      try {
        setEligible(localStorage.getItem(ELIGIBLE_KEY) === "1");
        setHidden(localStorage.getItem(DONE_KEY) === "1" || installed());
      } catch {
        setHidden(installed());
      }
    };
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as InstallEvent);
    };
    const onInstalled = () => {
      setHidden(true);
      setDeferredPrompt(null);
      try { localStorage.setItem(DONE_KEY, "1"); } catch { /* Storage unavailable. */ }
    };

    const frame = window.requestAnimationFrame(refresh);
    window.addEventListener("intereng-login-success", refresh);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("intereng-login-success", refresh);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    setHidden(true);
    try { localStorage.setItem(DONE_KEY, "1"); } catch { /* Storage unavailable. */ }
  }

  async function install() {
    if (!deferredPrompt) return;
    setDeferredPrompt(null);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") dismiss();
    } catch {
      // The browser may withdraw the prompt; wait for another install event.
    }
  }

  if (!eligible || hidden || !windowIsSecure() || (!deferredPrompt && !isIosSafari)) return null;

  return (
    <aside aria-label="Instalar InterEng Alagoas" className="fixed inset-x-3 bottom-20 z-50 rounded-lg border border-gold bg-background p-4 shadow-2xl sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold text-gold">Instale o InterEng Alagoas</h2>
          {isIosSafari && !deferredPrompt ? (
            <p className="mt-1 text-sm text-foreground">No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início.</p>
          ) : (
            <p className="mt-1 text-sm text-foreground">Acesse jogos e resultados direto da tela inicial.</p>
          )}
        </div>
        <button type="button" onClick={dismiss} aria-label="Dispensar sugestão de instalação" className="p-1 text-2xl leading-none text-muted hover:text-foreground">×</button>
      </div>
      {deferredPrompt && <Button type="button" onClick={install} className="mt-4 w-full">Instalar</Button>}
      {isIosSafari && !deferredPrompt && <Button type="button" variant="secondary" onClick={dismiss} className="mt-4 w-full">Entendi</Button>}
    </aside>
  );
}

function windowIsSecure() {
  if (typeof window === "undefined") return false;
  return window.isSecureContext || ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
}
