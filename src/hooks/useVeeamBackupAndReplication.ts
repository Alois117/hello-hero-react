import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { WEBHOOK_BACKUP_REPLICATION_URL } from "@/config/env";
import { safeParseResponse } from "@/lib/safeFetch";

const WEBHOOK_URL = WEBHOOK_BACKUP_REPLICATION_URL;
const REFRESH_INTERVAL = 5000; // 5 seconds

export interface VeeamJobMetrics {
  lastRun: string;
  lastRunDurationSec: number;
  avgDurationSec: number;
  lastTransferredDataBytes: number;
}

export interface VeeamParsedJob {
  job_type: string;
  target: string;
  schedule: string;
}

export interface VeeamMeta {
  platform: string;
}

export interface VeeamRawMessage {
  metrics: VeeamJobMetrics;
  parsed_job: VeeamParsedJob;
  meta: VeeamMeta;
}

export interface VeeamBackupJob {
  dedupe_key: string;
  category: string;
  vm_name: string;
  esxi_host: string;
  job_name: string;
  severity: string;
  raw_message: VeeamRawMessage;
}

export interface TransformedVeeamJob {
  id: string;
  vmName: string;
  jobName: string;
  esxiHost: string;
  status: "Success" | "Warning" | "Failed" | "Running" | "Unknown";
  lastRun: Date;
  durationSec: number;
  avgDurationSec: number;
  dataTransferredBytes: number;
  jobType: string;
  target: string;
  schedule: string;
  platform: string;
  category: string;
  dedupeKey: string;
  rawMessage: VeeamRawMessage;
}

// Map severity string to status
const mapSeverity = (severity: string): TransformedVeeamJob["status"] => {
  const lower = severity.toLowerCase();
  if (lower === "success") return "Success";
  if (lower === "warning") return "Warning";
  if (lower === "failed" || lower === "error") return "Failed";
  if (lower === "running" || lower === "in progress") return "Running";
  return "Unknown";
};

// Transform webhook data to our format
const transformVeeamJob = (job: VeeamBackupJob): TransformedVeeamJob => {
  return {
    id: job.dedupe_key,
    vmName: job.vm_name,
    jobName: job.job_name,
    esxiHost: job.esxi_host,
    status: mapSeverity(job.severity),
    lastRun: new Date(job.raw_message?.metrics?.lastRun || Date.now()),
    durationSec: job.raw_message?.metrics?.lastRunDurationSec || 0,
    avgDurationSec: job.raw_message?.metrics?.avgDurationSec || 0,
    dataTransferredBytes: job.raw_message?.metrics?.lastTransferredDataBytes || 0,
    jobType: job.raw_message?.parsed_job?.job_type || job.category || "BACKUP",
    target: job.raw_message?.parsed_job?.target || "Unknown",
    schedule: job.raw_message?.parsed_job?.schedule || "N/A",
    platform: job.raw_message?.meta?.platform || "Unknown",
    category: job.category,
    dedupeKey: job.dedupe_key,
    rawMessage: job.raw_message,
  };
};

// Format duration from seconds
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hours}h ${remainMins}m`;
};

// Format bytes to human-readable
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export interface VeeamCounts {
  success: number;
  warning: number;
  failed: number;
  running: number;
  total: number;
}

export interface UseVeeamBackupReturn {
  jobs: TransformedVeeamJob[];
  loading: boolean;
  error: string | null;
  counts: VeeamCounts;
  isConnected: boolean;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export const useVeeamBackupAndReplication = (): UseVeeamBackupReturn => {
  const [jobs, setJobs] = useState<TransformedVeeamJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Store job order and data separately
  const jobOrderRef = useRef<string[]>([]); // Array of job IDs in display order
  const jobsDataRef = useRef<Map<string, TransformedVeeamJob>>(new Map()); // Job data by ID

  // Calculate counts from jobs
  const counts: VeeamCounts = {
    success: jobs.filter(j => j.status === "Success").length,
    warning: jobs.filter(j => j.status === "Warning").length,
    failed: jobs.filter(j => j.status === "Failed").length,
    running: jobs.filter(j => j.status === "Running").length,
    total: jobs.length,
  };

  // Update jobs state while preserving order
  const updateJobsPreservingOrder = () => {
    const currentOrder = jobOrderRef.current;
    const jobsData = jobsDataRef.current;
    
    // Create new array in the existing order, using latest data
    const updatedJobs = currentOrder
      .map(id => jobsData.get(id))
      .filter((job): job is TransformedVeeamJob => job !== undefined);
    
    setJobs(updatedJobs);
  };

  // Smart update - only update data, preserve order
  const updateJobData = (newJobs: TransformedVeeamJob[]) => {
    const newJobsData = new Map<string, TransformedVeeamJob>();
    
    // Add all new jobs to the data map
    newJobs.forEach(job => {
      newJobsData.set(job.id, job);
    });

    // Update job order if this is the initial load or new jobs appeared
    if (jobOrderRef.current.length === 0) {
      // Initial load: use the order from the server
      jobOrderRef.current = newJobs.map(job => job.id);
    } else {
      // Subsequent updates: only add new job IDs to the end of the order
      const existingOrder = jobOrderRef.current;
      const newIds = newJobs.map(job => job.id);
      const existingIdsSet = new Set(existingOrder);
      
      // Add any new IDs to the end
      const newlyAddedIds = newIds.filter(id => !existingIdsSet.has(id));
      if (newlyAddedIds.length > 0) {
        jobOrderRef.current = [...existingOrder, ...newlyAddedIds];
      }
    }

    // Update the data map
    jobsDataRef.current = newJobsData;
    
    // Update the state with preserved order
    updateJobsPreservingOrder();
  };

  // Fetch jobs from webhook
  const { authenticatedFetch } = useAuthenticatedFetch();
  const fetchJobs = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const response = await authenticatedFetch(WEBHOOK_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await safeParseResponse<VeeamBackupJob[]>(response, WEBHOOK_URL);
      if (!result.ok) {
        throw new Error(result.userMessage);
      }

      if (!result.data) {
        setIsConnected(true);
        setLastUpdated(new Date());
        setError(null);
        if (!silent) setLoading(false);
        return;
      }
      
      // Handle both array and single object responses
      const webhookJobs: VeeamBackupJob[] = Array.isArray(result.data) ? result.data : [result.data];
      
      // Transform to our format
      const transformedJobs = webhookJobs.map(transformVeeamJob);
      
      // Update job data while preserving order
      updateJobData(transformedJobs);
      
      setIsConnected(true);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      const safe = err instanceof Error ? err.message : "We couldn't load backup jobs. Please try again.";
      console.error("[useVeeamBackup] Fetch error:", err);
      if (!silent) setError(safe);
      setIsConnected(false);
      // Keep existing data on error
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchJobs(false);
  }, [fetchJobs]);

  // Set up auto-refresh every 5 seconds (silent refresh)
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchJobs(true);
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchJobs]);

  const refresh = useCallback(async () => {
    await fetchJobs(false);
  }, [fetchJobs]);

  return {
    jobs,
    loading,
    error,
    counts,
    isConnected,
    lastUpdated,
    refresh,
  };
};

export default useVeeamBackupAndReplication;