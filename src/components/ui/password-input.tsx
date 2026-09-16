"use client";

import { useState } from "react";
import { inputClass } from "@/lib/ui";

export function PasswordInput({
  value,
  onChange,
  required,
  minLength,
  autoComplete,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} pr-16`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 px-3 text-xs font-semibold uppercase tracking-wide text-muted hover:text-gold"
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
      >
        {visible ? "Ocultar" : "Mostrar"}
      </button>
    </div>
  );
}
