// ============================================================
// Backup & Replication Types
// Handles dual-object API response: [MainData, MetaData]
// ============================================================

export type BackupReplicationStatus = "Success" | "Warning" | "STALE" | "Failed" | string;

// ============================================================
// Main Data Object (Index 0) Types
// ============================================================

export interface Summary {
  overview: {
    totalVMs: number;
    totalJobs: number;
  };
  protection: {
    protectedVMs: number;
    unprotectedVMs: number;
  };
  backupHealth: {
    staleBackups: number;
  };
  alerts: {
    warnings: number;
    critical: number;
  };
}

export interface VmInfo {
  name: string;
  powerState: string;
  guestOs: string;
  isProtected: boolean;
  lastProtectedDate: string;
}

export interface ProtectionSummary {
  totalJobs: number;
  overallStatus: BackupReplicationStatus;
  backupCurrent: boolean;
}

export interface BackupStatus {
  status: BackupReplicationStatus;
  jobStatus: string;
  backupAgeHours: number;
  ranWithinLast24Hours: boolean;
}

export interface ParsedJob {
  schedule: string;
  target: string;
  targetPlatform: string;
  client: string;
  location: string;
  source_host: string;
}

export interface Job {
  jobName: string;
  jobType: string;
  lastRun: string;
  lastRunDurationSec: number;
  avgDurationSec: number;
  lastTransferredBytes: number;
  platform: string;
  backupStatus: BackupStatus;
  parsedJob: ParsedJob;
}

export interface MatchedVm {
  vm: VmInfo;
  protectionSummary: ProtectionSummary;
  jobs: Job[];
}

export interface UnprotectedVm {
  name: string;
  powerState: string;
  guestOs: string;
  lastSeen?: string;
}

export interface OrphanJob {
  jobName: string;
  jobType: string;
  platform: string;
  schedule?: string;
  status: BackupReplicationStatus;
  lastRun?: string;
}

export interface MultiVmJob {
  jobName: string;
  jobType: string;
  platform: string;
  linkedVMs: string[];
  status: BackupReplicationStatus;
  lastRun?: string;
}

export interface Replica {
  name: string;
  sourceVm: string;
  target: string;
  status: BackupReplicationStatus;
  lastSync?: string;
  health?: string;
}

export interface AlertItem {
  id: string;
  severity: "warning" | "critical" | "info";
  message: string;
  relatedVm?: string;
  relatedJob?: string;
  timestamp: string;
}

export interface Statistics {
  successRate?: number;
  totalProtectedDataBytes?: number;
  avgBackupDurationSec?: number;
  jobsRanLast24h?: number;
  [key: string]: number | string | undefined;
}

// Main data object (index 0)
export interface MainDataObject {
  summary: Summary;
  matched: MatchedVm[];
  alerts: {
    warnings: AlertItem[];
    critical: AlertItem[];
  };
  statistics?: Statistics;
  vmsWithoutJobs?: UnprotectedVm[];
  jobsWithoutVMs?: OrphanJob[];
  multiVMJobs?: MultiVmJob[];
  replicas?: Replica[];
}

// ============================================================
// Meta Data Object (Index 1) Types - Change Tracking
// ============================================================

export interface ChangedJob {
  jobName: string;
  jobType: string;
  platform: string;
  status: BackupReplicationStatus;
  changeType: "new" | "modified" | "disabled" | "enabled";
  changedAt?: string;
  previousValue?: string;
  newValue?: string;
}

export interface Changes {
  new: ChangedJob[];
  modified: ChangedJob[];
  disabled: ChangedJob[];
  enabled: ChangedJob[];
  unchanged: ChangedJob[];
}

export interface ChangeSummary {
  totalJobs: number;
  newJobs: number;
  modifiedJobs: number;
  disabledJobs: number;
  enabledJobs: number;
}

// Meta data object (index 1)
export interface MetaDataObject {
  changes: Changes;
  summary: ChangeSummary;
}

// ============================================================
// API Response Type (Array of two objects)
// ============================================================

export type BackupReplicationApiResponse = [MainDataObject, MetaDataObject];
