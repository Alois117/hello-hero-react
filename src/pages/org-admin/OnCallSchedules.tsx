import OrgAdminLayout from "@/layouts/OrgAdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus } from "lucide-react";

const OnCallSchedules = () => {
  const schedules = [
    { id: 1, name: "Weekend On-Call", team: "Infrastructure", members: 3, active: true },
    { id: 2, name: "Weekday Primary", team: "DevOps", members: 5, active: true },
    { id: 3, name: "Holiday Coverage", team: "SRE", members: 2, active: false },
  ];

  return (
    <OrgAdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              On-Call Schedules
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage on-call rotation and escalation policies
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Schedule
          </Button>
        </div>

        <div className="space-y-4">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="p-6 bg-card/50 backdrop-blur border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                    <Clock className="w-6 h-6 text-background" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{schedule.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {schedule.team} • {schedule.members} members
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={schedule.active ? "default" : "secondary"}>
                    {schedule.active ? "Active" : "Inactive"}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </OrgAdminLayout>
  );
};

export default OnCallSchedules;
