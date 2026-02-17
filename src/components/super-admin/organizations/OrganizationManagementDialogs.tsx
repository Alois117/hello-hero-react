/**
 * Organization Management Dialogs
 * Create, Edit, and Toggle organization dialogs for Super Admin
 */
import { useState, useEffect } from "react";
import { Building2, Edit, Loader2, Plus, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { KeycloakOrganization, CreateOrgData, UpdateOrgData } from "@/hooks/keycloak/useKeycloakOrganizations";

// ─── Create Organization Dialog ─────────────────────────────────────────────

interface CreateOrgDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: CreateOrgData) => Promise<{ success: boolean; error?: string }>;
}

export const CreateOrganizationDialog = ({ open, onOpenChange, onCreate }: CreateOrgDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setDomain("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);

    const data: CreateOrgData = {
      name: name.trim(),
      description: description.trim() || undefined,
      enabled: true,
      domains: domain.trim() ? [{ name: domain.trim(), verified: false }] : undefined,
    };

    const result = await onCreate(data);
    setSubmitting(false);

    if (result.success) {
      onOpenChange(false);
    } else {
      setError(result.error || "Failed to create organization");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Create Organization
          </DialogTitle>
          <DialogDescription>
            Create a new tenant organization in Keycloak.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="org-name">Organization Name *</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="org-desc">Description</Label>
            <Textarea
              id="org-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="org-domain">Domain</Label>
            <Input
              id="org-domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. acme.com"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !name.trim()}>
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Edit Organization Dialog ───────────────────────────────────────────────

interface EditOrgDialogProps {
  org: KeycloakOrganization | null;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, data: UpdateOrgData) => Promise<{ success: boolean; error?: string }>;
}

export const EditOrganizationDialog = ({ org, onOpenChange, onUpdate }: EditOrgDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (org) {
      setName(org.name || "");
      setDescription(org.description || "");
      setError(null);
    }
  }, [org]);

  const handleSubmit = async () => {
    if (!org || !name.trim()) return;
    setSubmitting(true);
    setError(null);

    const result = await onUpdate(org.id, {
      name: name.trim(),
      description: description.trim() || undefined,
    });
    setSubmitting(false);

    if (result.success) {
      onOpenChange(false);
    } else {
      setError(result.error || "Failed to update organization");
    }
  };

  return (
    <Dialog open={!!org} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-primary" />
            Edit Organization
          </DialogTitle>
          <DialogDescription>
            Update organization details.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-org-name">Organization Name *</Label>
            <Input
              id="edit-org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="edit-org-desc">Description</Label>
            <Textarea
              id="edit-org-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !name.trim()}>
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Edit className="w-4 h-4 mr-2" />}
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
