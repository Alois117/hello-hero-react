import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  MainDataObject,
  MetaDataObject,
  BackupReplicationApiResponse,
  Summary,
  MatchedVm,
  AlertItem,
  Statistics,
  UnprotectedVm,
  OrphanJob,
  MultiVmJob,
  Replica,
  Changes,
  ChangeSummary,
} from "@/pages/user/backup-replication/types";

const ENDPOINT = "http://10.100.12.54:5678/webhook/backupandreplication";

type Status = "idle" | "loading" | "success" | "error";

export interface UseBackupReplicationReturn {
  // Status
  status: Status;
  loading: boolean;
  error: string | null;
  lastUpdatedAt: Date | null;
  refresh: () => Promise<void>;

  // Main data (from raw[0])
  summary: Summary | null;
  matched: MatchedVm[];
  alerts: { warnings: AlertItem[]; critical: AlertItem[] } | null;
  statistics: Statistics | null;
  vmsWithoutJobs: UnprotectedVm[];
  jobsWithoutVMs: OrphanJob[];
  multiVMJobs: MultiVmJob[];
  replicas: Replica[];

  // Meta data (from raw[1])
  changes: Changes | null;
  changeSummary: ChangeSummary | null;
}

export function useBackupReplication(): UseBackupReplicationReturn {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [mainData, setMainData] = useState<MainDataObject | null>(null);
  const [metaData, setMetaData] = useState<MetaDataObject | null>(null);
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

      const json = await res.json();

      // CRITICAL: API returns an array with exactly two objects
      // raw[0] = Main monitoring data
      // raw[1] = Change tracking / job activity
      if (Array.isArray(json) && json.length >= 2) {
        const [main, meta] = json as BackupReplicationApiResponse;
        setMainData(main);
        setMetaData(meta);
      } else if (Array.isArray(json) && json.length === 1) {
        // Fallback: only main data available
        setMainData(json[0] as MainDataObject);
        setMetaData(null);
      } else if (!Array.isArray(json) && typeof json === "object") {
        // Legacy fallback: single object response
        setMainData(json as MainDataObject);
        setMetaData(null);
      } else {
        throw new Error("Unexpected API response format");
      }

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
      // Status
      status,
      loading: status === "loading",
      error,
      lastUpdatedAt,
      refresh: fetchData,

      // Main data (from raw[0])
      summary: mainData?.summary ?? null,
      matched: mainData?.matched ?? [],
      alerts: mainData?.alerts ?? null,
      statistics: mainData?.statistics ?? null,
      vmsWithoutJobs: mainData?.vmsWithoutJobs ?? [],
      jobsWithoutVMs: mainData?.jobsWithoutVMs ?? [],
      multiVMJobs: mainData?.multiVMJobs ?? [],
      replicas: mainData?.replicas ?? [],

      // Meta data (from raw[1])
      changes: metaData?.changes ?? null,
      changeSummary: metaData?.summary ?? null,
    };
  }, [status, error, mainData, metaData, fetchData, lastUpdatedAt]);

  return result;
}
