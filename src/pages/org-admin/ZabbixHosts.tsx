import OrgAdminLayout from "@/layouts/OrgAdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Server, Plus } from "lucide-react";

const ZabbixHosts = () => {
  return (
    <OrgAdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Zabbix Hosts
            </h1>
            <p className="text-muted-foreground mt-1">
              Add and configure Zabbix monitored hosts
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Host
          </Button>
        </div>

        <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
          <h3 className="font-semibold text-lg mb-6">Add New Zabbix Host</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hostname">Hostname</Label>
                <Input id="hostname" placeholder="web-server-01" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="ip-address">IP Address</Label>
                <Input id="ip-address" placeholder="192.168.1.10" className="mt-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="zabbix-server">Zabbix Server URL</Label>
              <Input id="zabbix-server" placeholder="https://zabbix.example.com" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="port">Port</Label>
                <Input id="port" type="number" defaultValue="10050" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="template">Template</Label>
                <Input id="template" placeholder="Linux by Zabbix agent" className="mt-1" />
              </div>
            </div>
            <Button className="w-full">
              <Server className="w-4 h-4 mr-2" />
              Add Zabbix Host
            </Button>
          </div>
        </Card>
      </div>
    </OrgAdminLayout>
  );
};

export default ZabbixHosts;
