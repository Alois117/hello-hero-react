/**
 * Organization Management Dialogs
 * Create, Edit, and Toggle organization dialogs for Super Admin
 *
 * ✅ Update:
 * - Create Organization collects:
 *   - client_name + client_id (stored in Keycloak attributes as string[])
 *   - redirectUrl (top-level Keycloak org field)
 * - Description removed from Create dialog
 */
import { useState, useEffect, useMemo } from "react";
import { Building2, Edit, Loader2, Plus, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type {
  KeycloakOrganization,
  CreateOrgData,
  UpdateOrgData,
} from "@/hooks/keycloak/useKeycloakOrganizations";

// ─── Create Organization Dialog ─────────────────────────────────────────────

interface CreateOrgDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: CreateOrgData) => Promise<{ success: boolean; error?: string }>;
}

export const CreateOrganizationDialog = ({
  open,
  onOpenChange,
  onCreate,
}: CreateOrgDialogProps) => {
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientId, setClientId] = useState("");
  const [domain, setDomain] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [enabled, setEnabled] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const n = name.trim();
    const cn = clientName.trim();
    const cid = clientId.trim();
    if (!n || !cn || !cid) return false;
    return true;
  }, [name, clientName, clientId]);

  useEffect(() => {
    if (open) {
      setName("");
      setClientName("");
      setClientId("");
      setDomain("");
      setRedirectUrl("");
      setEnabled(true);
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    const n = name.trim();
    const cn = clientName.trim();
    const cid = clientId.trim();
    const d = domain.trim();
    const ru = redirectUrl.trim();

    if (!n) return setError("Organization name is required.");
    if (!cn) return setError("Client name is required.");
    if (!cid) return setError("Client id is required.");

    setSubmitting(true);
    setError(null);

    const data: CreateOrgData = {
      name: n,
      enabled,
      redirectUrl: ru || undefined,
      domains: d ? [{ name: d, verified: false }] : undefined,
      attributes: {
        client_name: [cn],
        client_id: [cid],
      },
    };

    const result = await onCreate(data);
    setSubmitting(false);

    if (result.success) onOpenChange(false);
    else setError(result.error || "Failed to create organization");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Create Organization
          </DialogTitle>
          <DialogDescription>Create a new tenant organization in Keycloak.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="org-name">Organization Name *</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chai Sacco"
              autoFocus
              disabled={submitting}
            />
          </div>

          <div>
            <Label htmlFor="client-name">Client Name *</Label>
            <Input
              id="client-name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Avis Kenya"
              disabled={submitting}
            />
          </div>

          <div>
            <Label htmlFor="client-id">Client ID *</Label>
            <Input
              id="client-id"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="e.g. 123"
              disabled={submitting}
              inputMode="numeric"
            />
          </div>

          <div>
            <Label htmlFor="org-domain">Domain</Label>
            <Input
              id="org-domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. chaisacco.co.ke"
              disabled={submitting}
            />
          </div>

          {/* ✅ NEW Redirect URL field */}
          <div>
            <Label htmlFor="org-redirect-url">Redirect URL</Label>
            <Input
              id="org-redirect-url"
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              placeholder="e.g. https://portal.chaisacco.co.ke"
              disabled={submitting}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border border-border/60 p-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Enabled</p>
              <p className="text-xs text-muted-foreground">
                Disabled orgs cannot access the portal.
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} disabled={submitting} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !canSubmit}>
            {submitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Edit Organization Dialog ───────────────────────────────────────────────
// Kept minimal; you can add redirectUrl editing later if desired.

interface EditOrgDialogProps {
  org: KeycloakOrganization | null;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, data: UpdateOrgData) => Promise<{ success: boolean; error?: string }>;
}

export const EditOrganizationDialog = ({ org, onOpenChange, onUpdate }: EditOrgDialogProps) => {
  const [name, setName] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (org) {
      setName(org.name || "");
      setEnabled(!!org.enabled);
      setError(null);
      setSubmitting(false);
    }
  }, [org]);

  const handleSubmit = async () => {
    if (!org || !name.trim()) return;

    setSubmitting(true);
    setError(null);

    const result = await onUpdate(org.id, {
      name: name.trim(),
      enabled,
    });

    setSubmitting(false);

    if (result.success) onOpenChange(false);
    else setError(result.error || "Failed to update organization");
  };

  return (
    <Dialog open={!!org} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-primary" />
            Edit Organization
          </DialogTitle>
          <DialogDescription>Update organization details.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-org-name">Organization Name *</Label>
            <Input
              id="edit-org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              disabled={submitting}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border border-border/60 p-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Enabled</p>
              <p className="text-xs text-muted-foreground">
                Toggle access for users in this org.
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} disabled={submitting} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !name.trim()}>
            {submitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Edit className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Toggle Organization Confirmation ───────────────────────────────────────

interface ToggleOrgDialogProps {
  org: KeycloakOrganization | null;
  onOpenChange: (open: boolean) => void;
  onToggle: (org: KeycloakOrganization) => Promise<{ success: boolean; error?: string }>;
}

export const ToggleOrganizationDialog = ({ org, onOpenChange, onToggle }: ToggleOrgDialogProps) => {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!org) return;
    setSubmitting(true);
    await onToggle(org);
    setSubmitting(false);
    onOpenChange(false);
  };

  const action = org?.enabled ? "Disable" : "Enable";

  return (
    <AlertDialog open={!!org} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Power className="w-5 h-5" />
            {action} Organization
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {action.toLowerCase()} <strong>{org?.name}</strong>?
            {org?.enabled
              ? " Users in this organization will lose access."
              : " Users in this organization will regain access."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
