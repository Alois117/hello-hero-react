export type ZabbixProblem = {
  id: string;
  problem: string;
  severity: "Info" | "Warning" | "Average" | "High" | "Disaster";
  timestamp: string;
};

export type VeeamJob = {
  id: string;
  jobName: string;
  status: "Success" | "Warning" | "Failed" | "Running";
  lastRun: string;
};

export type DummyUser = {
  id: string;
  username: string;
  email: string;
  role: "org_officer" | "user" | "org_admin" | "superadmin";
  organization: string;
};

export const zabbixProblems: ZabbixProblem[] = [
  { id: "zb-1", problem: "CPU load high on host web-01", severity: "High", timestamp: "2026-01-20T10:04:00Z" },
  { id: "zb-2", problem: "Disk space low on db-01 (/var)", severity: "Average", timestamp: "2026-01-20T09:52:00Z" },
  { id: "zb-3", problem: "ICMP ping lost to edge-fw", severity: "Disaster", timestamp: "2026-01-20T09:41:00Z" },
  { id: "zb-4", problem: "Agent unavailable on win-host-22", severity: "Warning", timestamp: "2026-01-20T09:20:00Z" },
];

export const veeamJobs: VeeamJob[] = [
  { id: "vm-1", jobName: "Daily VM Backup", status: "Success", lastRun: "2026-01-20 02:15" },
  { id: "vm-2", jobName: "SQL Transaction Logs", status: "Warning", lastRun: "2026-01-20 02:30" },
  { id: "vm-3", jobName: "Weekly Offsite Copy", status: "Failed", lastRun: "2026-01-19 23:10" },
];

export const dummyUsers: DummyUser[] = [
  { id: "u-1", username: "alice", email: "alice@example.com", role: "org_admin", organization: "Acme" },
  { id: "u-2", username: "bob", email: "bob@example.com", role: "user", organization: "Acme" },
  { id: "u-3", username: "carol", email: "carol@example.com", role: "superadmin", organization: "Global" },
];

