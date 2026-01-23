import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Power, PowerOff } from "lucide-react";

import type { ChangedJob, Changes, ChangeSummary } from "@/pages/user/backup-replication/types";
import { formatDateTime } from "@/pages/user/backup-replication/utils/format";
import StatusBadge from "@/pages/user/backup-replication/components/shared/StatusBadge";

interface ChangeActivityDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  changes: Changes | null;
  changeSummary: ChangeSummary | null;
  onSelectJob?: (job: ChangedJob) => void;
}

export default function ChangeActivityDrawer({
  open,
  onOpenChange,
  changes,
  changeSummary,
  onSelectJob,
}: ChangeActivityDrawerProps) {
  const [activeTab, setActiveTab] = useState("new");

  const tabData = {
    new: changes?.new ?? [],
    modified: changes?.modified ?? [],
    enabled: changes?.enabled ?? [],
    disabled: changes?.disabled ?? [],
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">Change Activity</SheetTitle>
          <SheetDescription>Job lifecycle tracking and change history</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">New</div>
                  <div className="text-xl font-bold text-emerald-500">{changeSummary?.newJobs ?? tabData.new.length}</div>
                </div>
                <Plus className="w-4 h-4 text-emerald-500" />
              </div>
            </Card>
            <Card className="p-3 border border-blue-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Modified</div>
                  <div className="text-xl font-bold text-blue-500">{changeSummary?.modifiedJobs ?? tabData.modified.length}</div>
                </div>
                <Pencil className="w-4 h-4 text-blue-500" />
              </div>
            </Card>
            <Card className="p-3 border border-amber-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Enabled</div>
                  <div className="text-xl font-bold text-amber-500">{changeSummary?.enabledJobs ?? tabData.enabled.length}</div>
                </div>
                <Power className="w-4 h-4 text-amber-500" />
              </div>
            </Card>
            <Card className="p-3 border border-red-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Disabled</div>
                  <div className="text-xl font-bold text-red-500">{changeSummary?.disabledJobs ?? tabData.disabled.length}</div>
                </div>
                <PowerOff className="w-4 h-4 text-red-500" />
              </div>
            </Card>
          </div>

          {/* Tabbed Tables */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start bg-muted/30 p-1">
              <TabsTrigger value="new" className="gap-1 text-xs">New ({tabData.new.length})</TabsTrigger>
              <TabsTrigger value="modified" className="gap-1 text-xs">Modified ({tabData.modified.length})</TabsTrigger>
              <TabsTrigger value="enabled" className="gap-1 text-xs">Enabled ({tabData.enabled.length})</TabsTrigger>
              <TabsTrigger value="disabled" className="gap-1 text-xs">Disabled ({tabData.disabled.length})</TabsTrigger>
            </TabsList>

            {Object.entries(tabData).map(([key, jobs]) => (
              <TabsContent key={key} value={key} className="mt-4">
                {jobs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                    No jobs in this category
                  </div>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead>Job Name</TableHead>
                          <TableHead>Platform</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Changed At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobs.map((job, idx) => (
                          <TableRow
                            key={`${job.jobName}-${idx}`}
                            className="hover:bg-muted/30 cursor-pointer"
                            onClick={() => onSelectJob?.(job)}
                          >
                            <TableCell className="font-medium">{job.jobName}</TableCell>
                            <TableCell>{job.platform ?? "—"}</TableCell>
                            <TableCell><StatusBadge status={job.status} size="sm" /></TableCell>
                            <TableCell className="text-muted-foreground">{formatDateTime(job.changedAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
