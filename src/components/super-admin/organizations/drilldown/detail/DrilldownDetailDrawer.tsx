/**
 * DrilldownDetailDrawer - Reusable Sheet-based drawer for item details
 * Renders category-specific detail views when an item is selected
 */
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertItem,
  HostItem,
  ReportItem,
  InsightItem,
  VeeamJobItem,
  UserItem,
  DrilldownCategory,
} from "@/hooks/super-admin/organizations/useOrganizationDetails";
import AlertDetail from "./AlertDetail";
import HostDetail from "./HostDetail";
import ReportDetail from "./ReportDetail";
import InsightDetail from "./InsightDetail";
import VeeamDetail from "./VeeamDetail";
import UserDetail from "./UserDetail";

type DrilldownItem = AlertItem | HostItem | ReportItem | InsightItem | VeeamJobItem | UserItem;

interface DrilldownDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  category: DrilldownCategory;
  item: DrilldownItem | null;
  orgName: string;
}

const categoryLabels: Record<string, string> = {
  alerts: "Alert Details",
  hosts: "Host Details",
  reports: "Report Details",
  insights: "Insight Details",
  veeam: "Veeam Job Details",
  users: "User Details",
};

const categoryDescriptions: Record<string, string> = {
  alerts: "Detailed alert information and metadata",
  hosts: "Host configuration and status details",
  reports: "Report metadata and configuration",
  insights: "AI-generated insight analysis",
  veeam: "Backup job execution details",
  users: "User account and role information",
};

const DrilldownDetailDrawer = ({
  open,
  onClose,
  category,
  item,
  orgName,
}: DrilldownDetailDrawerProps) => {
  if (!item || !category) return null;

  const renderDetail = () => {
    switch (category) {
      case "alerts":
        return <AlertDetail item={item as AlertItem} />;
      case "hosts":
        return <HostDetail item={item as HostItem} />;
      case "reports":
        return <ReportDetail item={item as ReportItem} />;
      case "insights":
        return <InsightDetail item={item as InsightItem} />;
      case "veeam":
        return <VeeamDetail item={item as VeeamJobItem} />;
      case "users":
        return <UserDetail item={item as UserItem} />;
      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        className="sm:max-w-lg w-full p-0 flex flex-col"
        aria-label={categoryLabels[category || ""] || "Item Details"}
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/50 flex-shrink-0">
          <SheetTitle className="text-base">
            {categoryLabels[category || ""] || "Details"}
          </SheetTitle>
          <SheetDescription>
            {categoryDescriptions[category || ""] || "Item details"} — {orgName}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 px-6 py-4">
          {renderDetail()}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default DrilldownDetailDrawer;
