"use client";

import * as React from "react";
import { useAuth } from "@clerk/nextjs";
import { FREE_EXPORT_LIMIT, type ExportQuota } from "@/lib/export-quota";

// Anonymous default — nothing has been counted yet, so nothing is locked.
// Building/editing a project anonymously stays completely untouched by
// this feature; only clicking Export ever prompts sign-in (handled by the
// callers of consume(), not here).
const ANONYMOUS_QUOTA: ExportQuota = {
  plan: "free",
  exportsUsed: 0,
  remaining: FREE_EXPORT_LIMIT,
  locked: false,
};

type ExportQuotaContextValue = {
  quota: ExportQuota;
  loading: boolean;
  isSignedIn: boolean | undefined;
  // Calls POST /api/export-quota. Returns null if the caller should handle
  // "not signed in" itself (e.g. open the sign-in modal) rather than the
  // exports-exhausted upgrade dialog.
  consume: () => Promise<(ExportQuota & { allowed: boolean }) | null>;
};

const ExportQuotaContext = React.createContext<ExportQuotaContextValue | null>(null);

export function ExportQuotaProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  // Only the fetched-from-server result lives in state — the anonymous
  // default is derived below, not synced via an effect, since it's a
  // pure function of isSignedIn rather than external/async data.
  const [serverQuota, setServerQuota] = React.useState<ExportQuota | null>(null);

  React.useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let cancelled = false;
    fetch("/api/export-quota")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ExportQuota | null) => {
        if (!cancelled && data) setServerQuota(data);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  const quota = isSignedIn ? (serverQuota ?? ANONYMOUS_QUOTA) : ANONYMOUS_QUOTA;
  const loading = Boolean(isSignedIn) && serverQuota === null;

  const consume = React.useCallback(async () => {
    if (!isSignedIn) return null;
    const res = await fetch("/api/export-quota", { method: "POST" });
    if (!res.ok) return null;
    const data: ExportQuota & { allowed: boolean } = await res.json();
    setServerQuota(data);
    return data;
  }, [isSignedIn]);

  const value = React.useMemo(
    () => ({ quota, loading, isSignedIn, consume }),
    [quota, loading, isSignedIn, consume],
  );

  return <ExportQuotaContext.Provider value={value}>{children}</ExportQuotaContext.Provider>;
}

export function useExportQuota() {
  const ctx = React.useContext(ExportQuotaContext);
  if (!ctx) {
    throw new Error("useExportQuota must be used within an ExportQuotaProvider");
  }
  return ctx;
}
