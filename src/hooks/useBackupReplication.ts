import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { BackupReplicationResponse } from "@/pages/user/backup-replication/types";

const ENDPOINT = "http://10.100.12.54:5678/webhook/backupandreplication";

type Status = "idle" | "loading" | "success" | "error";

interface UseBackupReplicationReturn {
  status: Status;
  loading: boolean;
  error: string | null;
  summary: BackupReplicationResponse["summary"] | null;
  matched: BackupReplicationResponse["matched"];
  alerts: BackupReplicationResponse["alerts"] | null;
  protection: BackupReplicationResponse["protection"] | null;
  backupHealth: BackupReplicationResponse["backupHealth"] | null;
  refresh: () => Promise<void>;
  lastUpdatedAt: Date | null;
}

export function useBackupReplication(): UseBackupReplicationReturn {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BackupReplicationResponse | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setError(null);

    try {
      const res = await fetch(ENDPOINT, {
        method: "GET",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }

      const json = (await res.json()) as BackupReplicationResponse;
      setData(json);
      setLastUpdatedAt(new Date());
      setStatus("success");
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setError(e?.message || "Failed to load backup & replication data");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  const result = useMemo<UseBackupReplicationReturn>(() => {
    return {
      status,
      loading: status === "loading",
      error,
      summary: data?.summary ?? null,
      matched: data?.matched ?? [],
      alerts: data?.alerts ?? null,
      protection: data?.protection ?? null,
      backupHealth: data?.backupHealth ?? null,
      refresh: fetchData,
      lastUpdatedAt,
    };
  }, [status, error, data, fetchData, lastUpdatedAt]);

  return result;
}
