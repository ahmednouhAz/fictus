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
  status: null,
  currentPeriodEnd: null,
};

// JSON has no Date type — currentPeriodEnd arrives from the API as an ISO
// string, not the Date the ExportQuota type claims. Parse it back so the
// type stays honest for consumers (e.g. the account page formatting it).
function parseQuota(data: ExportQuota): ExportQuota {
  return {
    ...data,
    currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null,
  };
}

type ExportQuotaContextValue = {
  quota: ExportQuota;
  loading: boolean;
  isSignedIn: boolean | undefined;
  // Calls POST /api/export-quota to record an export. Returns null only
  // if the caller should handle "not signed in" itself (e.g. open the
  // sign-in modal) — exports are never blocked once signed in, so every
  // other outcome is a successful record.
  consume: () => Promise<ExportQuota | null>;
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
      .then(async (res) => {
        if (!res.ok) {
          console.error("Failed to fetch export quota", res.status, await res.text());
          return null;
        }
        return res.json();
      })
      .then((data: ExportQuota | null) => {
        if (!cancelled && data) setServerQuota(parseQuota(data));
      })
      .catch((error) => console.error("Failed to fetch export quota", error));
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  const quota = isSignedIn ? (serverQuota ?? ANONYMOUS_QUOTA) : ANONYMOUS_QUOTA;
  const loading = Boolean(isSignedIn) && serverQuota === null;

  const consume = React.useCallback(async () => {
    if (!isSignedIn) return null;
    try {
      const res = await fetch("/api/export-quota", { method: "POST" });
      if (!res.ok) {
        console.error("Failed to record export usage", res.status, await res.text());
        return null;
      }
      const raw: ExportQuota = await res.json();
      const data = parseQuota(raw);
      setServerQuota(data);
      return data;
    } catch (error) {
      console.error("Failed to record export usage", error);
      return null;
    }
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
