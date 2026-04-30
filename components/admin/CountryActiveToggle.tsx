"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

interface CountryActiveToggleProps {
  countryId: string;
  initialActive: boolean;
}

export function CountryActiveToggle({ countryId, initialActive }: CountryActiveToggleProps) {
  const [isActive, setIsActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    const next = !isActive;
    setIsActive(next); // optimistic
    try {
      const res = await fetch(`/api/admin/countries/${countryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setIsActive(!next); // revert
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={isActive ? "Click to deactivate" : "Click to activate"}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
        isActive ? "border-emerald-500 bg-emerald-500" : "border-slate-300 bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          isActive ? "translate-x-3.5" : "translate-x-0.5"
        }`}
      />
      {loading && (
        <RefreshCw className="absolute right-[-18px] h-3 w-3 animate-spin text-slate-400" />
      )}
    </button>
  );
}
