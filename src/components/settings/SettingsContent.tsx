import { useState, useEffect, useMemo } from "react";
import { User, Bell, Shield, Save, Loader2, RefreshCw, Building2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useUserProfile } from "@/hooks/useUserProfile";

const SettingsContent = () => {
  const { profile, isLoading, error, isSaving, fetchProfile, updateProfile } = useUserProfile();

  // Editable form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Notification states (local only for now)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [telegramNotifications, setTelegramNotifications] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Sync form fields when profile loads
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
    }
  }, [profile]);

  // Determine if save should be enabled
  const hasChanges = useMemo(() => {
    if (!profile) return false;
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    return (
      trimmedFirst.length > 0 &&
      trimmedLast.length > 0 &&
      (trimmedFirst !== profile.firstName || trimmedLast !== profile.lastName)
    );
  }, [firstName, lastName, profile]);

  const handleSaveProfile = async () => {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (!trimmedFirst || !trimmedLast) {
      toast.error("First name and last name cannot be empty");
      return;
    }

    try {
      await updateProfile({
        given_name: trimmedFirst,
        family_name: trimmedLast,
      });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved!");
  };

  const handleSaveSecurity = () => {
    toast.success("Security settings updated!");
  };

  // ─── Loading state ───
  const renderProfileSkeleton = () => (
    <Card className="glass-card border-primary/20">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56 mt-1" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
      </CardContent>
    </Card>
  );

  // ─── Error state ───
  const renderProfileError = () => (
    <Card className="glass-card border-destructive/30">
      <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <div className="text-center space-y-1">
          <p className="font-medium text-foreground">Failed to load profile</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <Button variant="outline" onClick={fetchProfile} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );

  // ─── Profile form ───
  const renderProfileForm = () => (
    <Card className="glass-card border-primary/20">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Your account details from the identity provider</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="glass-input"
              placeholder="First name"
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="glass-input"
              placeholder="Last name"
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={profile?.username || "—"}
            className="glass-input opacity-70"
            readOnly
            disabled
          />
          <p className="text-xs text-muted-foreground">Username cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={profile?.email || "—"}
            className="glass-input opacity-70"
            readOnly
            disabled
          />
          <p className="text-xs text-muted-foreground">Email is managed by your identity provider</p>
        </div>

        {/* Organizations */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Organization(s)
          </Label>
          <div className="flex flex-wrap gap-2">
            {profile?.organizations && profile.organizations.length > 0 ? (
              profile.organizations.map((org) => (
                <Badge
                  key={org.code}
                  variant="outline"
                  className="border-primary/30 text-foreground px-3 py-1"
                >
                  {org.displayName}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </div>
        </div>

        <Button
          onClick={handleSaveProfile}
          className="neon-button"
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="glass-card border-primary/20">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          {isLoading
            ? renderProfileSkeleton()
            : error
              ? renderProfileError()
              : renderProfileForm()}
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Browser push notifications</p>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive SMS for critical issues</p>
                </div>
                <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Telegram Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notifications in Telegram</p>
                </div>
                <Switch checked={telegramNotifications} onCheckedChange={setTelegramNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Critical Alerts Only</Label>
                  <p className="text-sm text-muted-foreground">Only notify for high-severity issues</p>
                </div>
                <Switch />
              </div>
              <Button onClick={handleSaveNotifications} className="neon-button">
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Change Password</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input type="password" placeholder="Current password" className="glass-input" />
                  <Input type="password" placeholder="New password" className="glass-input" />
                  <Input type="password" placeholder="Confirm password" className="glass-input" />
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    {twoFactorEnabled ? "2FA is enabled" : "Add an extra layer of security"}
                  </p>
                </div>
                <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Active Sessions</Label>
                <div className="p-4 glass-card border border-border rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-muted-foreground">Chrome on Windows • 192.168.1.1</p>
                    </div>
                    <span className="text-xs text-success">Active</span>
                  </div>
                </div>
              </div>
              <Button onClick={handleSaveSecurity} className="neon-button">
                <Save className="w-4 h-4 mr-2" />
                Update Security
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsContent;
