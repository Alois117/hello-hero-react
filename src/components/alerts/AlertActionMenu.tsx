import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, CheckCircle, Eye, MessageSquare } from "lucide-react";

interface AlertActionMenuProps {
  alertId: number;
  acknowledged: boolean;
  onAcknowledge?: () => void;
  onViewDetails?: () => void;
}

const AlertActionMenu = ({
  acknowledged,
  onAcknowledge,
  onViewDetails,
}: AlertActionMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!acknowledged && (
          <DropdownMenuItem onClick={onAcknowledge}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Acknowledge
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onViewDetails}>
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem>
          <MessageSquare className="w-4 h-4 mr-2" />
          Add Comment
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AlertActionMenu;
