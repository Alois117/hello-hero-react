import { WireframeBox, WireframeText, WireframeInput } from "../../components";
import WireframeDashboardLayout from "../../layouts/WireframeDashboardLayout";

const WireframeAISettings = () => {
  return (
    <WireframeDashboardLayout role="org-admin" title="AI Settings">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div>
          <WireframeText variant="h1">[AI Settings]</WireframeText>
          <WireframeText variant="body">[Configure AI-powered features and model preferences]</WireframeText>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Features */}
          <WireframeBox label="AI Features">
            <div className="space-y-3">
              {[
                { name: "Automated Insights", enabled: true },
                { name: "Anomaly Detection", enabled: true },
                { name: "Predictive Alerts", enabled: false },
              ].map((feature, i) => (
                <div key={i} className="flex items-center justify-between p-3 border-2 border-dashed border-muted-foreground/20 rounded">
                  <WireframeText variant="body">[{feature.name}]</WireframeText>
                  <div className="w-12 h-6 border-2 border-dashed border-muted-foreground/30 rounded-full relative">
                    <div className={`w-5 h-5 rounded-full absolute top-0.5 ${feature.enabled ? "right-0.5 bg-primary/50" : "left-0.5 bg-muted"}`} />
                  </div>
                </div>
              ))}
            </div>
          </WireframeBox>

          {/* Model Preferences */}
          <WireframeBox label="Model Preferences">
            <div className="space-y-4">
              <WireframeInput label="Default AI Model" placeholder="GPT-4 / Claude / Ollama" type="select" />
              <WireframeInput label="Confidence Threshold" placeholder="High / Medium / Low" type="select" />
              <WireframeText variant="caption">[Configure which AI model powers your insights and what confidence level triggers recommendations]</WireframeText>
            </div>
          </WireframeBox>
        </div>
      </div>
    </WireframeDashboardLayout>
  );
};

export default WireframeAISettings;
