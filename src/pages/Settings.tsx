import { useState } from "react";
import { User, Bell, Palette, Shield, Key, Globe, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/components/layout/AppLayout";
import { toast } from "sonner";

const Settings = () => {
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("en");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully!");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved!");
  };

  const handleSaveSecurity = () => {
    toast.success("Security settings updated!");
  };

  return (
    <AppLayout>
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
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="w-4 h-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2">
              <Key className="w-4 h-4" />
              API Keys
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John" className="glass-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" className="glass-input" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="john.doe@avis.com" className="glass-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" defaultValue="Avis Inc." className="glass-input" />
                </div>
                <Button onClick={handleSaveProfile} className="neon-button">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
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

          {/* Appearance */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger id="theme" className="glass-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-primary/20">
                      <SelectItem value="dark">Dark (Cyberpunk)</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Language
                  </Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" className="glass-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-primary/20">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="neon-button">
                  <Save className="w-4 h-4 mr-2" />
                  Save Appearance
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
                  <div className="flex gap-2">
                    <Input type="password" placeholder="Current password" className="glass-input" />
                    <Input type="password" placeholder="New password" className="glass-input" />
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

          {/* API Keys */}
          <TabsContent value="api" className="space-y-6">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Manage your API keys for integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 glass-card border border-border rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Production API Key</p>
                      <code className="text-sm text-muted-foreground font-mono">nbg_prod_••••••••••••4a2f</code>
                      <p className="text-xs text-muted-foreground mt-1">Created on Nov 15, 2025</p>
                    </div>
                    <Button variant="destructive" size="sm">Revoke</Button>
                  </div>
                </div>
                <Button className="neon-button">
                  <Key className="w-4 h-4 mr-2" />
                  Generate New Key
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
