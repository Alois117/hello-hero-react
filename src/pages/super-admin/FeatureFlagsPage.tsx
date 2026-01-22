import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import { Card } from "@/components/ui/card";
import FeatureFlags from "@/components/features/FeatureFlags";

const FeatureFlagsPage = () => {
  return (
    <SuperAdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-destructive to-accent bg-clip-text text-transparent">
            Feature Flags
          </h1>
          <p className="text-muted-foreground mt-1">Control feature rollout across organizations</p>
        </div>
        <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
          <FeatureFlags />
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default FeatureFlagsPage;
