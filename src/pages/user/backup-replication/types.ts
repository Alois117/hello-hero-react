export type BackupReplicationStatus = "Success" | "Warning" | "STALE" | string;

export interface BackupReplicationResponse {
  summary: {
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
  };
  matched: MatchedVm[];
  alerts: any;
  protection: any;
  backupHealth: any;
}

export interface MatchedVm {
  vm: {
    name: string;
    powerState: string;
    guestOs: string;
    isProtected: boolean;
    lastProtectedDate: string;
  };
  protectionSummary: {
    totalJobs: number;
    overallStatus: BackupReplicationStatus;
    backupCurrent: boolean;
  };
  jobs: Job[];
}

export interface Job {
  jobName: string;
  jobType: string;
  lastRun: string;
  lastRunDurationSec: number;
  avgDurationSec: number;
  lastTransferredBytes: number;
  platform: string;
  backupStatus: {
    status: BackupReplicationStatus;
    jobStatus: string;
    backupAgeHours: number;
    ranWithinLast24Hours: boolean;
  };
  parsedJob: {
    schedule: string;
    target: string;
    targetPlatform: string;
    client: string;
    location: string;
    source_host: string;
  };
}
