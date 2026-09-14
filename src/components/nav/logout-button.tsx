"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={
        className ??
        "min-h-[40px] rounded-sm border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide hover:border-gold hover:text-gold disabled:opacity-50"
      }
    >
      Sair
    </button>
  );
}
